import React from 'react';
import'./Results.scss';

export default function Results(props) {
  if (props.addressLegit === null) {
    return null;
  }

  return (
    <div className={ `results-container ${props.addressLegit ? 'no-results' : 'results-found'}` }>
      {
        props.addressLegit ?
          <div className="header">No suspicious activity found</div> :
          <React.Fragment>
            <div className="header">Suspicious activity found!</div>
            <div className="message">
              Address <code>{props.searchAddress}</code> has participated in potentially fraudulent activity.
            </div>
          </React.Fragment>
      }
    </div>
  );
}