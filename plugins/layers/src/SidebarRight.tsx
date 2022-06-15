import styled from 'styled-components';

import { useStore } from '@magic-circle/state';
import { SPACING, COLORS, TYPO } from '@magic-circle/styles';

import type Layers from './index';
import { App, LayerExport } from '@magic-circle/schema';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: ${COLORS.white.css};
`;

const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const GroupHeader = styled.div`
  ${TYPO.title}
  display: flex;
  align-items: center;
  padding: 0 ${SPACING(1)}px;
  height: ${SPACING(5)}px;
  border-bottom: 1px solid ${String(COLORS.shades.s400.opacity(0.5))};
`;

type ControlProps = {
  layers: Layers;
  controlPath: string;
};

const Control = ({ layers, controlPath }: ControlProps) => {
  const control = useStore(layers.lookup.get(controlPath));

  console.log({
    control,
    controlPath,
    lookup: layers.lookup,
    store: layers.lookup.get(controlPath),
  });

  if (control && 'type' in control) {
    const Element = layers.getControlRenderer(control.type);

    if (!Element) {
      throw new Error(
        'Could not find control type, make sure to include it in the config file'
      );
    }

    return (
      <Element
        value={control.value}
        label={control.label}
        options={control.options}
        hasChanges={control.value !== control.initialValue}
        set={(newValue: any) => layers.setControl(control.path, newValue)}
        reset={() => layers.resetControl(control.path)}
      />
    );
  }

  throw new Error('Control data is corrupted');
};

type GroupProps = {
  layers: Layers;
  group: LayerExport;
};

const Group = ({ layers, group }: GroupProps) => {
  return (
    <GroupContainer>
      <GroupHeader>{group.name}</GroupHeader>
      {group.children.map((c) => {
        console.log({ c });
        if ('value' in c) {
          return <Control layers={layers} controlPath={c.path} />;
        }
      })}
    </GroupContainer>
  );
};

type SidebarProps = {
  app: App;
  layers: Layers;
};

const SidebarRight = ({ app, layers }: SidebarProps) => {
  const selected = useStore(layers.selected);
  const layer = useStore(layers.lookup.get(selected));

  console.log({ layer, selected, store: layers.lookup.get(selected) });

  if (layer && 'children' in layer) {
    return (
      <Container>
        {layer.children.map((item) => {
          if ('label' in item) {
            return <Control layers={layers} controlPath={item.path} />;
          }

          if (item.folder) {
            return <Group layers={layers} group={item} />;
          }
        })}
      </Container>
    );
  }

  return <Container />;
};

export default SidebarRight;