import { NULL_HOST } from '@/constants/Types';
import { ExternalClient } from '@/models/ExternalClient';
import { HostCommonDetails } from '@/models/Host';
import { ExtendedNode, Node } from '@/models/Node';
import { NodeConnectivityStatus } from '@/models/NodeConnectivityStatus';

/**
 * Calculates node connectivity using last check-in time.
 *
 * @param {number} lastCheckInTime node's last check-in time
 */
export const getConnectivityStatus = (lastCheckInTime: number): NodeConnectivityStatus => {
  const ERROR_THRESHOLD = 1800;
  const WARNING_THRESHOLD = 300;

  const currentTime = Date.now() / 1000;

  if (lastCheckInTime === undefined || lastCheckInTime === null) return 'unknown';
  else if (currentTime - lastCheckInTime >= ERROR_THRESHOLD) return 'error';
  else if (currentTime - lastCheckInTime >= WARNING_THRESHOLD) return 'warning';
  else return 'healthy';
};

/**
 * Calculates node connectivity using last check-in time.
 *
 * @param {Node} node the node whose connectivity is to be checked
 */
export const getNodeConnectivityStatus = (node: Node | ExternalClient): NodeConnectivityStatus => {
  return getConnectivityStatus((node as Node).lastcheckin);
};

/**
 * Derives the extended node for a given node.
 * This includes certain details from the associated host.
 *
 * @param node node to get extended version
 * @param hostCommonDetails all host common details
 * @returns node with associated common host details
 */
export function getExtendedNode(node: Node, hostCommonDetails: Record<string, HostCommonDetails>): ExtendedNode {
  const hostDetails = hostCommonDetails[node.hostid];
  return { ...node, ...(hostDetails ? hostDetails : NULL_HOST) };
}
