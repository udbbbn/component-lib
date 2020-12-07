import React, { useState, useEffect } from 'react'
import TableComponent from '../index'
import { columns } from '../columns'

export default function TableDemo() {
	return <TableComponent<Record<string, any>> columns={columns}></TableComponent>
}
