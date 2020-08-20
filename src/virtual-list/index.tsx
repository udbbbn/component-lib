import React, { useState } from 'react';
import style from  './index.module.scss'
import { CLIENT_RENEG_LIMIT } from 'tls';

interface VirtualListState {
  list: any[]
  visibleList: any[]
  viewHeight: number
  listTransY: number 
}

interface ListSource {
  key: string | number
  [x: string]: any
}

interface VirtualListProps {
  itemHeight: number // 根据实际项目情况 预估单个 item 的高度
  listHeight: number // list 容器高度
  bufferSize: number // 预渲染 item 数量 建议为双数可均匀分配至当前可视窗口的上下位
  listSource: ListSource[] // 数据源
  sourceValueKey: string // 渲染 listSource时 key 的取值
  pullDownRefresh: boolean // 是否开启下拉刷新
}

export default class VirtualList extends React.Component<VirtualListProps, VirtualListState> {

  static defaultProps: VirtualListProps = {
    itemHeight: 45,
    listHeight: 400,
    bufferSize: 6,
    listSource: Array(100).fill(1).map((el, i) => ({ key: i, value: i })),
    sourceValueKey: 'value',
    pullDownRefresh: true
  }

  listView = React.createRef<HTMLDivElement>()
  startIdx = 0
  endIdx = 0
  touchStartPos: {x: number, y: number} = { x: 0, y: 0 }
  touchEndPos: {x: number, y: number} = { x: 0, y: 0 }

  state: VirtualListState = {
    list: [],
    visibleList: [],
    viewHeight: 0,
    listTransY: 0,
  }

  componentDidMount() {
    this.initList();
  }

  initList() {
    const { listSource, pullDownRefresh } = this.props;
    this.setState({
      list: listSource,
      viewHeight: this.getViewHeight(listSource.length)
    }, () => this.updateVisibleList())
    this.listView.current!.addEventListener('scroll', this.scroll);
    if (pullDownRefresh) {
      this.listView.current!.addEventListener('touchstart', this.touchStart);
      this.listView.current!.addEventListener('touchmove', this.touchMove);
      this.listView.current!.addEventListener('touchend', this.touchEnd);
    }
  }

  // 更新视图
  updateVisibleList(scrollTop: number = 0) {
    const { itemHeight, listHeight, bufferSize } = this.props;
    const { list } = this.state;
    const visibleCount = Math.ceil(listHeight / itemHeight);
    this.startIdx = Math.floor(scrollTop / itemHeight);
    this.endIdx = this.startIdx + visibleCount;
    let offsetStart = 0, offsetEnd = 0;
    // 处理预渲染 
    if (this.startIdx === 0) {
      offsetEnd = bufferSize;
    } else if (this.endIdx === (list.length - 1)) {
      // 索引从 0 开始 0 - 99 
      // 因 slice(start end) 中 end 不包含 slice 中 所以 endIdx = 99 是不包含 99 这个值的 所以 offsetStart 要 + 1
      // offsetEnd 为 1 
      offsetStart = -bufferSize + 1;
      offsetEnd = 1;
      } else {
      const offsetMiddle = Math.floor(bufferSize / 2);
      if (this.startIdx > offsetMiddle && list.length >= this.endIdx + offsetMiddle) {
        offsetStart = -offsetMiddle;
        offsetEnd = bufferSize - offsetMiddle;
      } else if (this.startIdx <= offsetMiddle) {
        offsetStart = -this.startIdx;
        offsetEnd = bufferSize + offsetStart;
      } else {
        // (list.length <= this.endIdx + offsetMiddle)
        offsetEnd = list.length - this.endIdx;
        offsetStart = -(bufferSize - offsetEnd);
      } 
    }
    const visibleList = this.state.list.slice(this.startIdx + offsetStart, this.endIdx + offsetEnd)
    // NOTE 这里需要注意的点是 translate3d 中的 y 值 偏移量也要参与计算 将预渲染的元素不显示在可视窗口内
    // 如 startIdx 为 10 那就是以 10 计算位移量 而实际渲染时会 unshift(形如) bufferSize 至 10 的前面
    const listTransY = (this.startIdx + offsetStart) * itemHeight;
    this.setState({ visibleList, listTransY });
  }

  // 获取容器高度
  getViewHeight(listLength: number) {
    const { itemHeight } = this.props;
    return listLength * itemHeight
  }

  scroll = (e: Event) => {
    const { scrollTop } = (e.target as HTMLDivElement);
    this.updateVisibleList(scrollTop);
  }

  // touch 事件
  touchStart = (e: TouchEvent) => {
    const { touches } = e;
    const{ clientX: x, clientY: y } = touches[0];
    this.touchStartPos = { x, y };
  }

  touchMove = (e: TouchEvent) => {
    const { touches } = e;
    const{ clientX, clientY } = touches[0];
    const { x, y } = this.touchStartPos;
    console.log(clientX - x, clientY - y);
  }

  touchEnd = (e: TouchEvent) => {
    const { touches } = e;
    console.log('touchEnd attact');
    // const{ clientX, clientY } = touches[0];
    // console.log('end', clientX, clientY);
  }

  render() {
    const { sourceValueKey, itemHeight } = this.props;
    const { visibleList, viewHeight, listTransY } = this.state;
    return (
      <div className={style.list_view} ref={this.listView}>
        <div className={style.list_placeholder} style={{ height: `${viewHeight}px` }}></div>
        <div className={style.list_content} style={{ transform: `translate3d(0, ${listTransY}px, 0)` }}>
          {
            visibleList.map(el => (
              <div className={style.list_item} style={{ height: `${itemHeight}px` }} key={el.key}>{el[sourceValueKey]}</div>
            ))
          }
        </div>
      </div>
    )
  }
}