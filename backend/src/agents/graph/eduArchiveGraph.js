import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { routerNode } from '../nodes/routerNode.js';
import { toolSelectorNode } from '../nodes/toolSelectorNode.js';
import { toolExecutionNode } from '../nodes/toolExecutionNode.js';
import { retrievalAgent } from '../nodes/retrievalAgent.js';
import { documentAgent } from '../nodes/documentAgent.js';
import { verificationAgent } from '../nodes/verificationAgent.js';
import { anomalyAgent } from '../nodes/anomalyAgent.js';
import { criticAgent } from '../nodes/criticAgent.js';
import { humanReviewNode } from '../nodes/humanReviewNode.js';
import { persistVerificationNode } from '../nodes/persistVerificationNode.js';
import { routeAfterTools, routeFromCritic } from './router.js';

/**
 * EduArchive Agentic Workflow Graph
 * Implements the full LangGraph orchestration layer for:
 * 1. Intent routing & entity binding
 * 2. Dynamic tool selection & authorized execution
 * 3. OCR understanding & entity normalization
 * 4. Authoritative cross-verification against DB records
 * 5. Anomaly classification (tampering, prompt-injection, duplicate keys)
 * 6. Critic validation with retry loops
 * 7. Human review escalation
 * 8. Database state persistence
 */
const workflow = new StateGraph(AgentState)
  // Register all orchestrator agent nodes
  .addNode('router', routerNode)
  .addNode('toolSelectorNode', toolSelectorNode)
  .addNode('toolExecutionNode', toolExecutionNode)
  .addNode('retrievalAgent', retrievalAgent)
  .addNode('documentAgent', documentAgent)
  .addNode('verificationAgent', verificationAgent)
  .addNode('anomalyAgent', anomalyAgent)
  .addNode('criticAgent', criticAgent)
  .addNode('humanReviewNode', humanReviewNode)
  .addNode('persistVerificationNode', persistVerificationNode)

  // Configure Workflow Edges
  .addEdge(START, 'router')
  .addEdge('router', 'toolSelectorNode')
  .addEdge('toolSelectorNode', 'toolExecutionNode')

  // Conditional edge after tool execution -> Document Agent or Retrieval Agent
  .addConditionalEdges('toolExecutionNode', routeAfterTools, {
    documentAgent: 'documentAgent',
    retrievalAgent: 'retrievalAgent'
  })

  // Retrieval Agent reaches completion directly
  .addEdge('retrievalAgent', END)

  // Document verification pipeline
  .addEdge('documentAgent', 'verificationAgent')
  .addEdge('verificationAgent', 'anomalyAgent')
  .addEdge('anomalyAgent', 'criticAgent')

  // Conditional edge from Critic -> Retry, Human Review, or Persist
  .addConditionalEdges('criticAgent', routeFromCritic, {
    documentAgent: 'documentAgent',
    humanReviewNode: 'humanReviewNode',
    persistVerificationNode: 'persistVerificationNode'
  })

  // Human review routes to persistence
  .addEdge('humanReviewNode', 'persistVerificationNode')

  // State Persistence wraps up workflow
  .addEdge('persistVerificationNode', END);

// Compile the runnable graph
export const eduArchiveGraph = workflow.compile();

/**
 * High-level invocation wrapper with error handling and fallback
 */
export const runEduArchiveWorkflow = async (initialState) => {
  try {
    const result = await eduArchiveGraph.invoke(initialState);
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('[EduArchive LangGraph Execution Error]:', error);
    return {
      success: false,
      error: error.message,
      finalResponse: 'An unexpected issue occurred during agent workflow execution. Please retry.',
      steps: ['✕ Agent pipeline encountered an execution error. Reverting to manual fallback.'],
      actions: []
    };
  }
};

export default eduArchiveGraph;
