import React, {useState} from 'react';
import ErrorBoundary, {fallbackProps} from '../index';
import Button from './test';

function Error({onResetErrorBoundary} : fallbackProps) {
    return <div>
        <div>Error component</div>
        <button onClick={
            () => onResetErrorBoundary()
        }>reset</button>
    </div>
}

function Demo() {

    return (
        <ErrorBoundary fallback={Error}
            onError={
                () => console.log('发生错误啦！上报上报')
            }
            onReset={
                () => {
                    console.log('reset handler');
                }
        }>
            <Button></Button>
        </ErrorBoundary>
    );
}

export default Demo;
``
