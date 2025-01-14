import styled from 'styled-components';

import { Control as ControlSchema, ControlProps } from '@magic-circle/schema';
import { Control, Forms } from '@magic-circle/styles';

const Inside = styled(Control.Inside)`
  justify-content: flex-end;
`;

const BooleanControlField = ({
  value,
  label,
  set,
  hasChanges,
  reset,
}: ControlProps<boolean, never>) => {
  return (
    <Control.Container hasChanges={hasChanges} reset={reset}>
      <Control.Label>{label}</Control.Label>
      <Inside>
        <Forms.Checkbox
          value={value}
          onChange={(newVal) => {
            set(newVal);
          }}
        />
      </Inside>
    </Control.Container>
  );
};

const BooleanControl: ControlSchema = {
  name: 'boolean',
  render: (props: ControlProps<boolean, never>) => {
    return <BooleanControlField {...props} />;
  },
};

export default BooleanControl;
