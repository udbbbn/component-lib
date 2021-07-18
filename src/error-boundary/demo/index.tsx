import React, { useState } from 'react';
import ErrorBoundary, { fallbackProps, withErrorBoundary } from '../index';
import Button from './test';

function Error({ onResetErrorBoundary }: fallbackProps) {
	return (
		<div>
			<div>Error component</div>
			<button onClick={() => onResetErrorBoundary()}>reset</button>
		</div>
	);
}

function Demo() {
	const [keys, setKeys] = useState<{ id: number }[]>([]);

	setTimeout(() => {
		setKeys([{ id: 1 }]);
		console.log('setKeys');
	}, 3000);

	const ButtonUseErrorBoundary = withErrorBoundary(Button, {
		fallback: Error,
		resetKeys: keys,
		onResetKeysChange: (prevKeys, curKeys) => {
			// 对 resetKey 进行处理，更改后触发自身组件的重置
		},
		onError: () => console.log('发生错误啦！上报上报'),
		onReset: () => {
			console.log('reset handler');
		}
	});

	return <ButtonUseErrorBoundary />;
}

export default Demo;
