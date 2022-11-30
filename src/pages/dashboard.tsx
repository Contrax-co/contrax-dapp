import React from 'react';
import './dashboard.css';

export default function Dashboard({lightMode, props}: any) {

  return (
    <div className="dashboard">
      <div className="dashboard_header">
        <p className={`dashboard_title ${lightMode && "dashboard_title--light"}`}>Contrax Finance</p>
        <p className={`dashboard_description ${lightMode && "dashboard_description--light"}`}>Contrax autocompounds your rewards to boost your investments.</p>
      </div>
      
      <div className="panels">
        <div className="panel">
          <p className="panel_title">Total Liquidity</p>
          <p>-</p>
        </div>

        <div className="panel">
          <p className="panel_title">Net Market Gains</p>
          <p>-</p>
        </div>
        
        <div className="panel">
          <p className="panel_title">Liquidity pool gains</p>
          <p>-</p>
        </div>
        
        <div className="panel">
          <p className="panel_title">Pools</p>
          <p>-</p>
        </div>

      </div>

      <p className={`farms_title ${lightMode && "farms_title--light"}`}>Joined Farms</p>
    
      
    </div>
     
  );
}
