import React, { useState } from 'react';
import style from  './index.module.scss'

interface VirtualListState {
  list: any[]
  visibleList: any[]
  viewHeight: number
  listTransY: number
}

const LIST_HEIGHT = 400;
const ITEM_HEIGHT = 30;

export default class VirtualList extends React.Component<{}, VirtualListState> {

  listView = React.createRef<HTMLDivElement>()
  startIdx = 0
  endIdx = 0

  state: VirtualListState = {
    list: [],
    visibleList: [],
    viewHeight: 0,
    listTransY: 0
  }

  componentDidMount() {
    this.initList();
  }

  initList() {
    let { list } = this.state;
    Array(10000).fill(1).map((el, i) => { list.push({ key: i, value: i }) });
    this.setState({
      list,
      viewHeight: this.getViewHeight(list.length)
    }, () => this.updateVisibleList())
    this.listView.current!.addEventListener('scroll', this.scroll);
  }

  updateVisibleList(scrollTop: number = 0) {
    const visibleCount = Math.ceil(LIST_HEIGHT / ITEM_HEIGHT);
    this.startIdx = Math.floor(scrollTop / ITEM_HEIGHT);
    this.endIdx = this.startIdx + visibleCount;
    const visibleList = this.state.list.slice(this.startIdx, this.endIdx);
    const listTransY = this.startIdx * ITEM_HEIGHT;
    this.setState({ visibleList, listTransY });
  }

  getViewHeight = (listLength: number) => listLength * ITEM_HEIGHT

  scroll = (e: Event) => {
    const { scrollTop } = (e.target as HTMLDivElement);
    this.updateVisibleList(scrollTop);
  }

  render() {
    const { visibleList, viewHeight, listTransY } = this.state;
    return (
      <div className={style.list_view} ref={this.listView}>
        <div className={style.list_placeholder} style={{ height: `${viewHeight}px` }}></div>
        <div className={style.list_content} style={{ transform: `translate3d(0, ${listTransY}px, 0)` }}>
          {
            visibleList.map(el => (
              <div className={style.list_item} key={el.key}>{el.value}</div>
            ))
          }
        </div>
      </div>
    )
  }
}