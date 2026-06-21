import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { ComplaintTag } from '@/types/complaint';
import { useComplaintStore } from '@/store/useComplaintStore';

interface TagSelectorProps {
  selected: ComplaintTag[];
  onToggle: (tag: ComplaintTag) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selected, onToggle }) => {
  const { tagOptions } = useComplaintStore();

  return (
    <View className={styles.container}>
      {tagOptions.map((opt) => {
        const isActive = selected.includes(opt.value);
        return (
          <Text
            key={opt.value}
            className={classnames(styles.tagItem, isActive && styles.active)}
            style={isActive ? { backgroundColor: opt.color } : {}}
            onClick={() => onToggle(opt.value)}
          >
            {opt.label}
          </Text>
        );
      })}
    </View>
  );
};

export default TagSelector;
