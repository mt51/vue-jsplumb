<template>
  <div id="app">
    <div class="jtk-demo" id="jtk-demo">
      <div class="node-list" id="node-list">
        <p v-for="(item, index) in nodeList" :key="index" :class="`jtk-node jtk-node-${item.type}`" :data-node-type="item.type" :id="`jtk_node_${item.type}`"><span :data-node-type="item.type">{{item.text}}</span></p>
      </div>
      <div class="main-container" ref="wfMain"></div>
    </div>
    <el-button type="primary" class="save-info" @click="handleSaveWFInfo">保存</el-button>
    <el-dialog :visible.sync="dialogVisible" title="输入新的文本">
      <el-input v-model="text" :autofocus="true" @keyup.native.enter="handleConfirm"></el-input>
      <div slot="footer">
        <el-button type="primary" @click="handleConfirm">确定</el-button>
        <el-button type="info" @click="handleCancel">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="overlaysDialog" title="输入新的文本">
      <el-input v-model="text" :autofocus="true" @keyup.native.enter="handleConfirm"></el-input>
      <div slot="footer">
        <el-button type="primary" @click="handleOverlayTextConfirm">确定</el-button>
        <el-button type="info" @click="handleOverlayTextCancel">关闭</el-button>
      </div>
    </el-dialog>
    <el-button v-show="deleteVisible" id="jtk-node-delete" plain class="jtk-node-delete" @click="handleDelNode">删除</el-button>
  </div>
</template>

<script>
const idTables = {
  start: 0,
  condition: 0,
  work: 0,
  end: 0
}
const infoMsg = {
  startCountOver: '开始节点只能存在一个',
  endCountOver: '结束节点只能存在一个'
}
export default {
  name: 'App',
  data() {
    return {
      nodeList: [
        {
          type: 'start',
          text: '开始'
        },
        {
          type: 'condition',
          text: '判断'
        },
        {
          type: 'work',
          text: '事务'
        },
        {
          type: 'end',
          text: '结束'
        }
      ],
      dialogVisible: false,
      text: '',
      params: null,
      wfInfo: [],
      nodeInfo: [],
      left: false,
      overlaysDialog: false,
      deleteVisible: false,
      deleteId: null,
      deleteType: null
    }
  },
  methods: {
    handleConfirm() {
      this.dialogVisible = !this.dialogVisible
      this.handleCreatNode()
      this.clearParams()
    },
    handleCancel() {
      this.dialogVisible = !this.dialogVisible
      this.clearParams()
    },
    handleDialogVisible(params) {
      const { e } = params
      const nodeType = e.target.dataset.nodeType
      if (this.left) {
        if (
          (nodeType === 'start' || nodeType === 'end') &&
          idTables[nodeType]
        ) {
          this.$message({
            type: 'warning',
            message: infoMsg[`${nodeType}CountOver`]
          })
          return
        }
        this.dialogVisible = !this.dialogVisible
        this.params = params
      }
    },
    handleCreatNode() {
      const mainContainer = this.$refs.wfMain
      const { e, drag } = this.params
      const jtkNodeType = drag.el.dataset.nodeType
      const jtkNodeId = `jtk_node_${jtkNodeType}_${idTables[jtkNodeType]}`
      idTables[jtkNodeType]++
      const originEle = document.querySelector(`#jtk_node_${jtkNodeType}`)
      const clientX = e.clientX
      const clientY = e.clientY
      const posX = clientX - originEle.clientWidth / 2
      const posY = clientY - originEle.clientHeight / 2
      const cloneEle = originEle.cloneNode(true)
      cloneEle.removeAttribute('draggable')
      cloneEle.id = jtkNodeId
      cloneEle.style.top = `${posY}px`
      cloneEle.style.left = `${posX}px`
      cloneEle.innerHTML = `<span>${this.text}</span>`
      mainContainer.appendChild(cloneEle)
      this._wf._draggable(`#${jtkNodeId}`)
      this.addContextMenuEventForJtkNode(jtkNodeId, jtkNodeType)
      this._wf._addEndpoint(jtkNodeId, jtkNodeType)
    },
    handleSaveWFInfo() {
      const arr = this._wf._getConnections()
      const nodeEleList = document.querySelectorAll('.main-container .jtk-node')
      arr.forEach(item => {
        console.log(item)
        this.wfInfo.push({
          connectionId: item.id,
          sourceId: item.sourceId,
          targetId: item.targetId,
          sourceText: item.source.innerText,
          targetText: item.target.innerText
        })
      })
      nodeEleList.forEach(item => {
        this.nodeInfo.push({
          nodeId: item.id,
          content: item.innerHTML,
          posx: item.style.left,
          posy: item.style.top
        })
      })
      const wf = {
        connection: this.wfInfo,
        node: this.nodeInfo
      }
      window.localStorage.setItem('wf', wf)
    },
    handleChangeOverlayText(params, originEvent) {
      this.text = params.label
      this.params = params
      this.params._targetId = originEvent.target.id
      this.overlaysDialog = true
    },
    handleOverlayTextConfirm() {
      const label = document.querySelector(`#${this.params._targetId}`)
      label.innerText = this.text
      this.overlaysDialog = false
      this.clearParams()
    },
    handleOverlayTextCancel() {
      this.overlaysDialog = false
      this.clearParams()
    },
    clearParams() {
      this.text = ''
      this.null = ''
    },
    addContextMenuEventForJtkNode(id) {
      const jtkNode = document.querySelector(`#${id}`)
      const delBtn = document.querySelector('#jtk-node-delete')
      const self = this
      jtkNode.oncontextmenu = function(event) {
        const originEle =
          event.target.tagName === 'SPAN'
            ? event.target.parentNode
            : event.target
        self.deleteId = originEle.id
        self.deleteType = originEle.dataset.nodeType
        self.deleteVisible = true
        delBtn.style.top = event.clientY + 'px'
        delBtn.style.left = event.clientX + 'px'
        if (event.preventDefault) {
          event.preventDefault()
        } else {
          event.returnValue = false
        }
      }
    },
    handleDelNode() {
      const { deleteId, deleteType } = this
      const delNode = document.querySelector(`#${deleteId}`)
      delNode.parentNode.removeChild(delNode)
      this._wf._deleteEndpoint(deleteId, deleteType)
      this.deleteId = null
      this.deleteType = null
      this.deleteVisible = false
      idTables[deleteType]--
    }
  },
  mounted() {
    this.$nextTick(() => {
      const self = this
      this._wf._draggable('.jtk-node', {
        clone: true,
        start() {
          self.left = true
        },
        stop() {
          self.left = false
        }
      })
      this._wf._onDropEndEvent('.main-container', this.handleDialogVisible)
      this._wf._addConnectListener(this.handleChangeOverlayText)
    })
  }
}
</script>
