import React from "react";
import AnimatedProgressProvider from "./AnimatedProgressProvider";
import { easeQuadInOut } from "d3-ease";
import {
    CircularProgressbar,
    buildStyles
  } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ProgressBar = (props) => {

    const MyProgress = (props) => {
        return (
        <div class="row">
            <div class="col-lg-5"/>
            <div class="col-lg-2">      
              <div class="inner-center">
                <div style={{ width: "35%"}}></div>
              <div style={{ width: "30%"}}>{props.children}</div>
              <div style={{ width: "35%"}}></div>
            </div>
            </div>
            <div class="col-lg-5"/>
        </div>
        );
    }

    return (
        <div>
            <MyProgress>
            <AnimatedProgressProvider
            valueStart={50}
            valueEnd={95}
            duration={1.4}
            easingFunction={easeQuadInOut}
            repeat
            >
            {(value) => {
                const roundedValue = Math.round(value);
                return (
                <CircularProgressbar
                    value={value}
                    text={`${roundedValue}%`}
                    styles={buildStyles({ pathTransition: "none" })}
                />
                );
            }}
            </AnimatedProgressProvider>
            </MyProgress>
        </div>
    );

};

export default ProgressBar;