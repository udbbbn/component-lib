import React, { Component, ReactElement, useState } from 'react';

declare function FallbackRender(props: fallbackProps): fallbackElement;

type fallbackComponent = React.ComponentType<fallbackProps> & ReactElement;

type fallbackElement = ReactElement<unknown | string> | typeof FallbackRender | fallbackComponent | null;

export type fallbackProps = {
	error: Error;
	onResetErrorBoundary: () => void;
};

interface ErrorBoundaryProps {
	fallback?: fallbackElement; // 发生错误时的渲染函数
	onError?: (error: Error, msg: string) => void; // 发生错误时的回调函数
	onReset?: () => void; // 重置函数
	resetKeys?: unknown[]; // 模拟 useEffect deps 实现重置功能
	onResetKeysChange?: (prevResetKey: unknown[] | undefined, resetKey: unknown[] | undefined) => void;
}

interface ErrorBoundaryState {
	error: Error | null;
}

const initialState: ErrorBoundaryState = {
	error: null
};

const arrayDiff = (a: unknown[] = [], b: unknown[] = []) => a.length !== b.length || a.some((item, idx) => !Object.is(item, b[idx]));

class ErrorBoundary extends Component<React.PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
	updatedWithError = false;

	state = {
		...initialState
	};
	constructor(props: React.PropsWithChildren<ErrorBoundaryProps>) {
		super(props);
	}

	static getDerivedStateFromError(error: Error) {
		// 更新 state 使下一次渲染能够显示降级后的 UI
		return { error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// 你同样可以将错误日志上报给服务器
		if (this.props.onError) {
			this.props.onError(error, errorInfo.componentStack);
		}
	}

	componentDidUpdate(prevProps: Readonly<React.PropsWithChildren<ErrorBoundaryProps>>) {
		const { error } = this.state;
		const { resetKeys, onResetKeysChange } = this.props;

		// 边界情况：
		// 由 resetKey 中的某个key引发的一个错误
		// getDerivedStateFromError 中的 return 会导致组件 re-render
		// 这里避免重复render， 用变量控制 return 一次
		if (error !== null && !this.updatedWithError) {
			this.updatedWithError = true;
			return;
		}

		if (error !== null && arrayDiff(prevProps.resetKeys, resetKeys)) {
			onResetKeysChange?.(prevProps.resetKeys, resetKeys);
			this.reset();
		}
	}

	reset = () => {
		this.updatedWithError = false;
		this.setState({
			...initialState
		});
	};

	resetErrorBoundary = () => {
		if (this.props.onReset) {
			this.props.onReset();
		}
		this.reset();
	};

	render() {
		const { fallback } = this.props;
		const { error } = this.state;

		const componentProps: fallbackProps = {
			error: error!,
			onResetErrorBoundary: this.resetErrorBoundary
		};

		if (error !== null) {
			if (React.isValidElement(fallback)) {
				return fallback;
			}

			if ((fallback as fallbackComponent)?.prototype?.isReactComponent) {
				return React.cloneElement(fallback as fallbackComponent, componentProps);
			}

			if (typeof fallback === 'function') {
				return (fallback as typeof FallbackRender)(componentProps);
			}

			throw new Error('ErrorBoundary 组件需要传入 fallback');
		}
		return this.props.children;
	}
}

export default ErrorBoundary;

// 高阶函数
export function withErrorBoundary<P>(Component: React.ComponentType<P>, errorBoundaryProps: ErrorBoundaryProps) {
	// eslint-disable-next-line react/display-name
	const wrapper = (props: P) => (
		<ErrorBoundary {...errorBoundaryProps}>
			<Component {...props}></Component>
		</ErrorBoundary>
	);

	const name = Component.displayName || Component.name || 'unknown';
	// devtools的名称! 学到了
	wrapper.displayName = `withErrorBoundary(${name})`;

	return wrapper;
}

// 提供 hooks 快捷报错
// 其实就一个小报错 hooks
export function useErrorHandler<P = Error>(givenError?: P | null | undefined) {
	const [error, setError] = useState<P | null>(null);
	// 初始化遇到错误直接抛出
	if (givenError) {
		throw givenError;
	}
	if (error) {
		throw error;
	}
	return setError;
}
