import { Host } from '@/models/Host';
import { Node } from '@/models/Node';
import { NodeConnectivityStatus } from '@/models/NodeConnectivityStatus';
import { Tag } from 'antd';
import { getNodeConnectivityStatus } from './NodeUtils';

export function renderNodeHealth(health: NodeConnectivityStatus) {
  switch (health) {
    case 'unknown':
      return <Tag>Unknown</Tag>;
    case 'error':
      return <Tag color="error">Error</Tag>;
    case 'warning':
      return <Tag color="warning">Warning</Tag>;
    case 'healthy':
      return <Tag color="success">Healthy</Tag>;
  }
}

export function getTimeMinHrs(duration: number) {
  // TODO: review this calc
  const minutes = duration / 60000000000;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.ceil(((minutes / 60) % 1) * 60);
  return { hours, min: remainingMinutes };
}

// Gets host health as the worst health of associated nodes
export function getHostHealth(
  hostId: Host['id'],
  hostNodes: Node[],
  shouldRender = true
): JSX.Element | NodeConnectivityStatus {
  const nodeHealths = hostNodes
    .filter((n) => n.hostid === hostId)
    .map((n) => getNodeConnectivityStatus(n))
    .map((h) => {
      switch (h) {
        case 'healthy':
          return 3;
        case 'warning':
          return 2;
        case 'error':
          return 1;
        default:
          return 0;
      }
    })
    .filter((h) => h !== 0);

  let worstHealth = Number.MAX_SAFE_INTEGER;
  nodeHealths.forEach((h) => {
    worstHealth = Math.min(worstHealth, h);
  });

  switch (worstHealth) {
    default:
      return shouldRender ? <Tag>Unknown</Tag> : 'unknown';
    case 1:
      return shouldRender ? <Tag color="error">Error</Tag> : 'error';
    case 2:
      return shouldRender ? <Tag color="warning">Warning</Tag> : 'warning';
    case 3:
      return shouldRender ? <Tag color="success">Healthy</Tag> : 'healthy';
  }
}