import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useComplaintStore } from '@/store/useComplaintStore';
import ComplaintCard from '@/components/ComplaintCard';
import type { ComplaintStatus, ComplaintTag } from '@/types/complaint';

type FilterKey = ComplaintStatus | 'all' | 'callback';

const RecordsPage: React.FC = () => {
  const { complaints, tagOptions } = useComplaintStore();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeTag, setActiveTag] = useState<ComplaintTag | 'all'>('all');

  const filtered = useMemo(() => {
    let list = [...complaints];

    if (searchText) {
      const kw = searchText.toLowerCase();
      list = list.filter(
        (c) =>
          c.customer.name.toLowerCase().includes(kw) ||
          c.customer.phone.includes(kw) ||
          (c.relatedProject || '').toLowerCase().includes(kw)
      );
    }

    if (activeFilter === 'callback') {
      list = list.filter((c) => c.needCallback);
    } else if (activeFilter !== 'all') {
      list = list.filter((c) => c.status === activeFilter);
    }

    if (activeTag !== 'all') {
      list = list.filter((c) => c.tags.includes(activeTag));
    }

    return list;
  }, [complaints, searchText, activeFilter, activeTag]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '处理中' },
    { key: 'done', label: '已完成' },
    { key: 'callback', label: '待回访' },
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>协商记录</Text>
        <Text className={styles.subTitle}>追踪所有客诉处理进度</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          placeholder="搜索顾客姓名/手机号/项目"
          confirmType="search"
        />
      </View>

      <ScrollView scrollX className={styles.filterRow}>
        {filters.map((f) => (
          <Text
            key={f.key}
            className={classnames(styles.filterChip, activeFilter === f.key && styles.active)}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </Text>
        ))}
      </ScrollView>

      <ScrollView scrollX className={styles.filterRow}>
        <Text
          className={classnames(styles.filterChip, activeTag === 'all' && styles.active)}
          onClick={() => setActiveTag('all')}
        >
          全部类型
        </Text>
        {tagOptions.map((t) => (
          <Text
            key={t.value}
            className={classnames(styles.filterChip, activeTag === t.value && styles.active)}
            style={activeTag === t.value ? { background: t.color } : {}}
            onClick={() => setActiveTag(t.value)}
          >
            {t.label}
          </Text>
        ))}
      </ScrollView>

      <View className={styles.summaryBar}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNum}>{filtered.length}</Text>
          <Text className={styles.summaryLabel}>筛选结果</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNum} style={{ color: '#22C55E' }}>
            {filtered.filter((c) => c.status === 'done').length}
          </Text>
          <Text className={styles.summaryLabel}>已解决</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryNum} style={{ color: '#F97316' }}>
            {filtered.filter((c) => c.status !== 'done').length}
          </Text>
          <Text className={styles.summaryLabel}>处理中</Text>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无符合条件的记录</Text>
        </View>
      ) : (
        filtered.map((c) => (
          <ComplaintCard
            key={c.id}
            complaint={c}
            onClick={() => Taro.navigateTo({ url: `/pages/complaint-detail/index?id=${c.id}` })}
          />
        ))
      )}
    </ScrollView>
  );
};

export default RecordsPage;
