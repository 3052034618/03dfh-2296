import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useComplaintStore } from '@/store/useComplaintStore';
import StatCard from '@/components/StatCard';
import ComplaintCard from '@/components/ComplaintCard';
import type { ComplaintStatus } from '@/types/complaint';

const TodayPage: React.FC = () => {
  const { complaints, dailyStats, getComplaintsByStatus } = useComplaintStore();
  const [activeFilter, setActiveFilter] = useState<ComplaintStatus | 'all'>('all');

  const filteredComplaints = useMemo(() => {
    if (activeFilter === 'all') return complaints;
    return getComplaintsByStatus(activeFilter);
  }, [activeFilter, complaints, getComplaintsByStatus]);

  const callbacks = useMemo(
    () =>
      complaints.filter((c) => c.needCallback && c.callbackDate === '2026-06-22' && c.status !== 'done'),
    [complaints]
  );

  const handleCardClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/complaint-detail/index?id=${id}` });
  };

  const handleQuickAction = (action: string) => {
    console.log('[Today] Quick action:', action);
    switch (action) {
      case 'register':
        Taro.switchTab({ url: '/pages/register/index' });
        break;
      case 'search':
        Taro.navigateTo({ url: '/pages/customer-search/index' });
        break;
      case 'confirm':
        Taro.switchTab({ url: '/pages/confirm/index' });
        break;
      case 'callback':
        Taro.showToast({ title: '已提醒回访', icon: 'success' });
        break;
    }
  };

  const handleRefresh = () => {
    Taro.stopPullDownRefresh();
    Taro.showToast({ title: '刷新成功', icon: 'success' });
  };

  React.useEffect(() => {
    Taro.eventCenter.on('__taroStartPullDownRefresh', handleRefresh);
    return () => {
      Taro.eventCenter.off('__taroStartPullDownRefresh', handleRefresh);
    };
  }, []);

  const filters: { key: ComplaintStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: complaints.length },
    { key: 'pending', label: '待处理', count: dailyStats.pendingCount },
    { key: 'processing', label: '处理中', count: dailyStats.processingCount },
    { key: 'done', label: '已完成', count: dailyStats.doneCount },
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.greeting}>
        <Text className={styles.greetingTitle}>早上好，店长</Text>
        <Text className={styles.greetingSub}>今天有 {dailyStats.pendingCount} 条客诉待处理</Text>
      </View>

      <View className={styles.statsRow}>
        <StatCard value={dailyStats.pendingCount} label="待处理" color="#F97316" />
        <StatCard value={dailyStats.processingCount} label="处理中" color="#3B82F6" />
        <StatCard value={dailyStats.doneCount} label="已完成" color="#22C55E" />
        <StatCard value={`¥${dailyStats.totalCompensation}`} label="今日赔付" primary />
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionCard} onClick={() => handleQuickAction('register')}>
          <View className={styles.actionIcon} style={{ background: 'rgba(107, 92, 231, 0.12)' }}>
            <Text>📝</Text>
          </View>
          <View className={styles.actionText}>
            <Text className={styles.actionTitle}>快速登记</Text>
            <Text className={styles.actionDesc}>新建客诉记录</Text>
          </View>
        </View>

        <View className={styles.actionCard} onClick={() => handleQuickAction('search')}>
          <View className={styles.actionIcon} style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
            <Text>🔍</Text>
          </View>
          <View className={styles.actionText}>
            <Text className={styles.actionTitle}>顾客搜索</Text>
            <Text className={styles.actionDesc}>查询顾客档案</Text>
          </View>
        </View>

        <View className={styles.actionCard} onClick={() => handleQuickAction('confirm')}>
          <View className={styles.actionIcon} style={{ background: 'rgba(34, 197, 94, 0.12)' }}>
            <Text>✅</Text>
          </View>
          <View className={styles.actionText}>
            <Text className={styles.actionTitle}>赔付确认</Text>
            <Text className={styles.actionDesc}>待顾客确认</Text>
          </View>
        </View>

        <View className={styles.actionCard} onClick={() => handleQuickAction('callback')}>
          <View className={styles.actionIcon} style={{ background: 'rgba(249, 115, 22, 0.12)' }}>
            <Text>📞</Text>
          </View>
          <View className={styles.actionText}>
            <Text className={styles.actionTitle}>回访提醒</Text>
            <Text className={styles.actionDesc}>{callbacks.length} 条待回访</Text>
          </View>
        </View>
      </View>

      {callbacks.length > 0 && (
        <View className={styles.callbackSection}>
          <Text className={styles.callbackTitle}>
            <Text>⏰</Text>
            今日回访提醒（{callbacks.length}）
          </Text>
          {callbacks.map((c) => (
            <View key={c.id} className={styles.callbackItem}>
              <Image className={styles.callbackAvatar} src={c.customer.avatar} mode="aspectFill" />
              <View className={styles.callbackInfo}>
                <Text className={styles.callbackName}>{c.customer.name}</Text>
                <Text className={styles.callbackTime}>{c.relatedProject || '客诉跟进'}</Text>
              </View>
              <Button className={styles.callbackBtn} onClick={() => handleCardClick(c.id)}>
                去处理
              </Button>
            </View>
          ))}
        </View>
      )}

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>客诉列表</Text>
        <Text className={styles.sectionMore}>共 {filteredComplaints.length} 条</Text>
      </View>

      <ScrollView scrollX className={styles.filterTabs}>
        {filters.map((f) => (
          <Text
            key={f.key}
            className={classnames(styles.filterTab, activeFilter === f.key && styles.active)}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label} ({f.count})
          </Text>
        ))}
      </ScrollView>

      {filteredComplaints.length === 0 ? (
        <View style={{ padding: '80rpx 0', textAlign: 'center' }}>
          <Text style={{ color: '#9CA3AF', fontSize: '28rpx' }}>暂无相关客诉记录</Text>
        </View>
      ) : (
        filteredComplaints.map((c) => (
          <ComplaintCard key={c.id} complaint={c} onClick={() => handleCardClick(c.id)} />
        ))
      )}
    </ScrollView>
  );
};

export default TodayPage;
