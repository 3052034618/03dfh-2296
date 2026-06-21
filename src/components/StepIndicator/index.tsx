import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { NegotiationStep } from '@/types/complaint';

interface StepIndicatorProps {
  steps: NegotiationStep[];
  onClick?: (key: NegotiationStep['key']) => void;
  clickable?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, onClick, clickable = false }) => {
  const currentIdx = steps.findIndex((s) => !s.completed);

  return (
    <View className={styles.container}>
      {steps.map((step, idx) => {
        const isDone = step.completed;
        const isCurrent = idx === currentIdx;
        return (
          <View
            key={step.key}
            className={classnames(styles.stepItem, isDone && styles.done)}
            onClick={() => clickable && onClick?.(step.key)}
          >
            <View
              className={classnames(
                styles.stepCircle,
                isDone && styles.done,
                isCurrent && !isDone && styles.current
              )}
            >
              {isDone ? '✓' : idx + 1}
            </View>
            <Text
              className={classnames(
                styles.stepLabel,
                (isDone || isCurrent) && styles.active
              )}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default StepIndicator;
