import React from 'react';
import styled from 'styled-components';

import { AppProvider } from '@magic-circle/state';
import {
  COLORS,
  SPACING,
  BREAKPOINTS,
  TYPO,
  registerIcon,
  Close,
  Command,
  Search,
  Delete,
  Icon,
  WarningTriangle,
} from '@magic-circle/styles';

import Header from './Header';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import CommandLine from './CommandLine';
import Inner from './Inner';

import APP from '../app/app';

registerIcon(Close);
registerIcon(Command);
registerIcon(Search);
registerIcon(Delete);
registerIcon(WarningTriangle);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Inside = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const Frame = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  background: ${COLORS.white.css};
  border: none;
`;

const Iframe = styled.iframe`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${COLORS.white.css};
  border: none;

  ${BREAKPOINTS.max.medium`
    position: fixed;
    top: 0;
    left: 0;
  `}
`;

// const SpacerFrame = styled.div`
//   flex: 1;
//   height: 100%;
//   background: ${COLORS.white.css};
// `;

const MobileWarning = styled.div`
  ${TYPO.regular}
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: ${SPACING(3)}px;
  display: none;
  align-items: center;
  gap: ${SPACING(0.5)}px;
  padding-left: ${SPACING(1)}px;
  background: ${COLORS.shades.s600.css};
  color: ${COLORS.shades.s100.css};
  border-bottom: 1px solid ${COLORS.shades.s600.css};

  ${BREAKPOINTS.max.medium`
    display: flex;
  `}
`;

export default function App() {
  const url =
    typeof APP.config.url === 'string'
      ? APP.config.url
      : APP.config.url(process.env.BUILD_ENV === 'develop');

  return (
    <AppProvider app={APP}>
      <Container>
        <Header />
        <Inside>
          <SidebarLeft />
          <Frame id="frame">
            <Iframe
              allow="display-capture"
              src={url}
              onLoad={() => APP.setup()}
            />
            <Inner />
          </Frame>
          <SidebarRight />
        </Inside>
        <CommandLine />
      </Container>
      <MobileWarning>
        <Icon
          name="WarningTriangle"
          width={SPACING(1.5)}
          height={SPACING(1.5)}
        />
        Magic Circle is not available on mobile
      </MobileWarning>
    </AppProvider>
  );
}
