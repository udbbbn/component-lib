import { useRef } from 'react'

export function useCompare(val: any, compare: (value: any, other: any) => boolean) {
	const ref = useRef(null)

	if (!compare(val, ref.current)) {
		ref.current = val
	}

	return ref.current
}
