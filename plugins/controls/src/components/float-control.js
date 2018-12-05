import React from 'react';
import styled from 'styled-components';

import {Row, Label, Center, Value, TextBox} from './styles';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
  cursor: grab;
  background: rgba(100,100,100,0.1);
`;

const Slider = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  background: none;
  cursor: grab;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 2px;
    height: 20px;
    background: rgb(136, 74, 255);
    cursor: grab;
  }

  &::-webkit-slider-runnable-track{
    height: 20px;
    background: none;
  }

  &:focus{
    outline: none;
  }
`;

const Progress = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${props => props.progress}%;
  height: 100%;
  background: rgba(136, 74, 255, 0.2);
  cursor: grab;
`;

const FloatControl = props => {
  const { value, options, updateControl } = props;
  const { range, stepSize } = options;
  const progress = ((value - parseInt(range[0])) * 100) / (parseInt(range[1]) - parseInt(range[0]));
  const extent = Math.abs(parseInt(range[1]) - parseInt(range[0]));
  const step = stepSize === 0 ? extent / 100 : stepSize;

  return (
    <Row>
      <Label>{props.label}</Label>
      <Center>
        <InputContainer>
          <Progress progress={progress}/>
          <Slider
            value={value}
            onChange={evt => { updateControl(+evt.target.value) }}
            type="range"
            min={parseInt(range[0])}
            max={parseInt(range[1])}
            step={step}
          />
        </InputContainer>
      </Center>
      <Value>
        {props.value}
      </Value>
    </Row>
  );
};

FloatControl.type = 'float';
export default FloatControl;