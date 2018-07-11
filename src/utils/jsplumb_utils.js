import { jsPlumb } from 'jsplumb'

const connectorPaintStyle = {
  strokeWidth: 2,
  stroke: '#61b7cf',
  joinstyle: 'round',
  outlineStroke: 'white',
  outlineWidth: 2
}

const connectorHoverStyle = {
  strokeWidth: 3,
  stroke: '#216477',
  outlineWidth: 5,
  outlineStroke: 'white'
}
const endpointHoverStyle = {
  fill: '#216477',
  stroke: '#216477'
}

const sourceEndpoint = {
  endpoint: 'Dot',
  paintStyle: {
    stroke: '#7AB02C',
    fill: 'transparent',
    radius: 7,
    strokeWidth: 1
  },
  isSource: true,
  connector: [
    'Flowchart',
    {
      stub: [40, 60],
      gap: 10,
      cornerRadius: 5,
      alwaysRespectStubs: true
    }
  ],
  connectorStyle: connectorPaintStyle,
  connectorHoverStyle: connectorHoverStyle,
  hoverPaintStyle: endpointHoverStyle
}

const targetEndpoint = {
  endpoint: 'Dot',
  paintStyle: { fill: '#7ab02c', radius: 7 },
  hoverPaintStyle: endpointHoverStyle,
  maxConnections: -1,
  dropOptions: {
    hoverClass: 'hover',
    activeClass: 'active'
  },
  isTarget: true
}

const endPointList = {
  start: {
    source: ['Bottom'],
    target: []
  },
  end: {
    source: [],
    target: ['Top']
  },
  condition: {
    target: ['Top', 'Bottom'],
    source: ['Left', 'Right']
  },
  work: {
    target: ['Top'],
    source: ['Bottom']
  }
}

class WF {
  constructor() {
    this.instance = jsPlumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      ConnectionOverlays: [
        [
          'Arrow',
          {
            location: 0.9,
            visible: true,
            width: 15,
            length: 15,
            id: 'ARROW',
            events: {
              click() {
                alert('you clicked on the arrow overlay')
              }
            }
          }
        ],
        [
          'Label',
          {
            location: 0.5,
            visible: true,
            id: 'label',
            label: 'Text',
            cssClass: 'rs-conn-label'
          }
        ]
      ]
    })
  }

  _draggable(element, options = {}) {
    this.instance.draggable(jsPlumb.getSelector(element), options)
  }
  _onDropEndEvent(element, callback) {
    this.instance.droppable(jsPlumb.getSelector(element), {
      drop: callback
    })
  }
  _addEndpoint(toId, type) {
    const endpoint = endPointList[type]
    const sourceLen = endpoint.source.length
    const targetLen = endpoint.target.length
    for (let i = 0; i < sourceLen; i++) {
      const sourceUUID = toId + endpoint.source[i]
      sourceEndpoint.cssClass = `source-endpoint-${type}-${endpoint.source[i]}`
      this.instance.addEndpoint(toId, sourceEndpoint, {
        anchor: endpoint.source[i],
        uuid: sourceUUID
      })
    }
    for (let i = 0; i < targetLen; i++) {
      const targetUUID = toId + endpoint.target[i]
      targetEndpoint.cssClass = `target-endpoint-${type}-${endpoint.target[i]}`
      this.instance.addEndpoint(toId, targetEndpoint, {
        anchor: endpoint.target[i],
        uuid: targetUUID
      })
    }
  }
  _deleteEndpoint(toId, type) {
    const tempEndpoint = endPointList[type]
    const endpoint = [...tempEndpoint.source, ...tempEndpoint.target]
    endpoint.forEach(item => {
      const uuid = toId + item
      this.instance.deleteEndpoint(uuid)
    })
  }
  _getConnections(scope = '', options = {}) {
    return this.instance.getConnections(scope, options)
  }
  _addConnectListener(callback) {
    this.instance.bind('connection', (connInfo, originalEvent) => {
      const label = connInfo.connection.getOverlay('label')
      label.bind('click', callback)
    })
  }
}
export default WF
