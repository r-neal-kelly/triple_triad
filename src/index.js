import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

class TripleTriad extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <h1>Hello, World!</h1>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <TripleTriad />
    </React.StrictMode>
);
