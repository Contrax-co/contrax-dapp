import React from 'react';
import './PoolButton.css';

function PoolButton({ description, active, lightMode, ...props}:any) {
  return (
    <div className={`button ${lightMode && "button--light"} ${active && "button--selected"} ${active && lightMode && "button--selected--light"}`} onClick={props.onClick}>
      {description}
    </div>
  )
}

export default PoolButton