import React, {Component, ReactElement} from 'react';

declare function FallbackRender(props : fallbackProps): fallbackElement

type fallbackComponent = React.ComponentType < fallbackProps > & ReactElement;

type fallbackElement = ReactElement < unknown | string | React.FC | typeof Component > | typeof FallbackRender | fallbackComponent | null;

export type fallbackProps = {
    error: Error;
    onResetErrorBoundary: () => void
}

interface ErrorBoundaryProps {
    fallback?: fallbackElement; // 发生错误时的渲染函数
    onError?: (error : Error, msg : string) => void; // 发生错误时的回调函数
    onReset?: () => void // 重置函数
}

interface ErrorBoundaryState {
    error: Error | null
}

const initialState: ErrorBoundaryState = {
        error: null
    }

    class ErrorBoundary extends Component < React.PropsWithChildren < ErrorBoundaryProps >,
    ErrorBoundaryState > {
        state = {
            ... initialState
        }
        constructor(props : any) {
            super(props);
        }

        static getDerivedStateFromError(error : Error) { // 更新 state 使下一次渲染能够显示降级后的 UI
            return {error};
        }

        componentDidCatch(error : Error, errorInfo : React.ErrorInfo) { // 你同样可以将错误日志上报给服务器
            if (this.props.onError) {
                this.props.onError(error, errorInfo.componentStack)
            }
        }

        resetErrorBoundary = () => {
            if (this.props.onReset) {
                this.props.onReset()
            }
            this.setState({
                ... initialState
            })
        }

        render() {
            const {fallback} = this.props;
            const {error} = this.state;

            const componentProps: fallbackProps = {
                error: error !,
                onResetErrorBoundary: this.resetErrorBoundary
            }

            if (error !== null) {
                if (React.isValidElement(fallback)) {
                    return fallback
                }

                if ((fallback as fallbackComponent) ?. prototype ?. isReactComponent) {
                    return React.cloneElement(fallback as fallbackComponent, componentProps)
                }

                if (typeof fallback === 'function') {
                    return(fallback as typeof FallbackRender)(componentProps)
                }

                throw new Error('ErrorBoundary 组件需要传入 fallback')
            }
            return this.props.children;
        }
    }

    export default ErrorBoundary;
