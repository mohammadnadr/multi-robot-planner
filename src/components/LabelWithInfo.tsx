import type { ReactNode } from 'react';
import { InfoTip } from './InfoTip';

type Props = {
  tip: string;
  children: ReactNode;
  placement?: 'up' | 'down';
  className?: string;
  as?: 'span' | 'div';
};

export function LabelWithInfo({
  tip,
  children,
  placement = 'up',
  className,
  as: Tag = 'span',
}: Props) {
  return (
    <Tag className={`label-with-info ${className ?? ''}`.trim()}>
      <span className="label-with-info__text">{children}</span>
      <InfoTip text={tip} placement={placement} />
    </Tag>
  );
}
