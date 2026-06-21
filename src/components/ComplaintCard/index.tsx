import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Complaint } from '@/types/complaint';
import { useComplaintStore } from '@/store/useComplaintStore';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick?: () => void;
}

const statusMap = {
  pending: { text: '待处理', className: styles.statusPending },
  processing: { text: '处理中', className: styles.statusProcessing },
  done: { text: '已完成', className: styles.statusDone },
};

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onClick }) => {
  const { tagOptions } = useComplaintStore();
  const statusInfo = statusMap[complaint.status];
  const completedSteps = complaint.steps.filter((s) => s.completed).length;

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.customerInfo}>
          <Image
            className={styles.avatar}
            src={complaint.customer.avatar}
            mode="aspectFill"
          />
          <View className={styles.customerMeta}>
            <Text className={styles.customerName}>{complaint.customer.name}</Text>
            <View className={styles.customerSub}>
              <Text>{complaint.customer.phone}</Text>
              <Text className={styles.memberLevel}>{complaint.customer.memberLevel}</Text>
            </View>
          </View>
        </View>
        <Text className={classnames(styles.statusBadge, statusInfo.className)}>
          {statusInfo.text}
        </Text>
      </View>

      {complaint.relatedProject && (
        <Text className={styles.projectName}>关联项目：{complaint.relatedProject}</Text>
      )}

      <View className={styles.tagList}>
        {complaint.tags.map((tag) => {
          const tagOpt = tagOptions.find((t) => t.value === tag);
          return (
            <Text
              key={tag}
              className={styles.tag}
              style={{
                backgroundColor: tagOpt ? `${tagOpt.color}15` : '#F3F4F6',
                color: tagOpt?.color || '#6B7280',
              }}
            >
              {tagOpt?.label || tag}
            </Text>
          );
        })}
      </View>

      <Text className={styles.statement}>{complaint.customerStatement}</Text>

      <View className={styles.footer}>
        <Text className={styles.time}>{complaint.createTime.slice(5, 16)}</Text>
        <View className={styles.stepsPreview}>
          {complaint.steps.map((step, idx) => (
            <View
              key={step.key}
              className={classnames(styles.stepDot, step.completed && styles.done)}
            />
          ))}
          <Text style={{ fontSize: '24rpx', color: '#9CA3AF', marginLeft: '8rpx' }}>
            {completedSteps}/3
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ComplaintCard;
