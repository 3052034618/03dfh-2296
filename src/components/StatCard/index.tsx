import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  value: string | number;
  label: string;
  color?: string;
  primary?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color, primary }) => {
  return (
    <View className={classnames(styles.card, primary && styles.primary)}>
      <Text className={styles.value} style={color ? { color } : {}}>
        {value}
      </Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
