import React from 'react';
import styled from 'styled-components';

import { useStore } from '@magic-circle/state';
import { LayoutHook } from '@magic-circle/schema';
import { SPACING, COLORS, TYPO, Icon } from '@magic-circle/styles';

import APP from '../app/app';

const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${SPACING(5)}px;
  background: ${COLORS.shades.s700.css};
  padding-right: ${SPACING(1)}px;
`;

const Part = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${SPACING(5)}px;
  height: 100%;

  &:after {
    content: '';
    width: 14px;
    height: 14px;
    border-radius: 14px;
    border: 2.21px ${COLORS.accent.css} solid;
    box-sizing: border-box;
  }
`;

const ButtonCollections = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  gap: ${SPACING(1)}px;
`;

const ButtonCollection = styled.div`
  display: flex;
  color: ${COLORS.accent.css};
  border: 1px solid ${COLORS.accent.css};
  border-radius: 5px;
  height: ${SPACING(3)}px;
`;

type ButtonProps = {
  disabled?: boolean;
};

const Button = styled.div<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${SPACING(3)}px;
  height: ${SPACING(3) - 2}px;
  border-right: 1px solid ${COLORS.accent.css};
  cursor: pointer;
  transition: background 0.2s ease;
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'all')};

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: ${String(COLORS.accent.opacity(0.2))};
  }
`;

const Title = styled.div`
  ${TYPO.title}
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${COLORS.white.css};
  pointer-events: none;
`;

const sortHelper = (
  key: string,
  after?: string | string[],
  before?: string | string[]
) => {
  if (after) {
    if (Array.isArray(after) && after.includes(key)) {
      return 1;
    }
    if (!Array.isArray(after) && after === key) {
      return 1;
    }
  }

  if (before) {
    if (Array.isArray(before) && before.includes(key)) {
      return -1;
    }
    if (!Array.isArray(before) && before === key) {
      return -1;
    }
  }

  return 0;
};

const Header = () => {
  const buttons = useStore(APP.buttons);
  const { title } = useStore(APP.pageInfo);
  const hooks = useStore(APP.layoutHooks);

  return (
    <Container>
      <Part>
        <Logo
          href="https://magic-circle.dev"
          target="_blank"
          rel="noreferrer"
        />
        <ButtonCollections>
          {Object.keys(buttons)
            .sort((a: string, b: string) => {
              const valueA = buttons[a];
              const valueB = buttons[b];

              return (
                sortHelper(b, valueA.after, valueA.before) ||
                sortHelper(a, valueB.after, valueA.before) * -1
              );
            })
            .map((key) => (
              <ButtonCollection key={key}>
                {buttons[key].list
                  .filter((button) => !button.hide)
                  .map((button) => (
                    <Button
                      disabled={button.disabled}
                      key={button.label}
                      onClick={() => button.onClick()}
                    >
                      <Icon
                        name={button.icon}
                        width={SPACING(2)}
                        height={SPACING(2)}
                      />
                    </Button>
                  ))}
              </ButtonCollection>
            ))}
        </ButtonCollections>
      </Part>
      <Title>{title}</Title>
      <Part>{hooks[LayoutHook.HEADER_RIGHT]}</Part>
    </Container>
  );
};

export default Header;
