import React from 'react'

interface uiParams {
  msg: string,
  size?: string
}

const wrapperStyle = {
  padding: '.4em 1em',
  whiteSpace: 'pre-line',
  wordBreak: 'keep-all',
  position: "relative",
  borderRadius: '2.2em'
} as React.CSSProperties

const sizes: { [propName: string]: string } = {
  small: '10px',
  normal: '12px',
  large: '14px',
}

export default function DanmakuUi({ msg, size = 'normal' }: uiParams) {
  const fontSize = sizes[size];
  return (
    <div style={{ ...wrapperStyle, fontSize }}>
      {msg}
    </div>
  )
}