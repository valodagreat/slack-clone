import React from 'react';

function Spinner() {
    return (
        <div>
            <div className="ui active transition visible dimmer">
                <div className="content">
                    <div className="ui text loader">
                        Preparing Chat
                    </div>
                </div>
            </div>
            <img alt="bckground" src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" className="ui image"/>
        </div>
    )
}

export default Spinner
