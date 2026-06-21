import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useComplaintStore } from '@/store/useComplaintStore';

const roleLabel: Record<string, string> = {
  consultant: '咨询师',
  doctor: '医生',
  nurse: '护士',
};

const RankingPage: React.FC = () => {
  const { ranking, projectStats, staffStats } = useComplaintStore();

  const chartColors = ['#6B5CE7', '#8B7CF0', '#3B82F6', '#22C55E', '#F97316'];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>门店排行</Text>
        <Text className={styles.subTitle}>本月数据统计（截至2026-06-22）</Text>
      </View>

      <View className={styles.overviewCard}>
        <Text className={styles.overviewTitle}>西城中心店（本店）本月概览</Text>
        <View className={styles.overviewRow}>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewNum}>18</Text>
            <Text className={styles.overviewLabel}>客诉总数</Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewNum}>83%</Text>
            <Text className={styles.overviewLabel}>解决率</Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewNum}>¥1,850</Text>
            <Text className={styles.overviewLabel}>平均赔付</Text>
          </View>
          <View className={styles.overviewItem}>
            <Text className={styles.overviewNum}>3</Text>
            <Text className={styles.overviewLabel}>排名</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>🏆</Text>区域门店排行
        </Text>
        <View className={styles.card}>
          <View className={styles.rankList}>
            {ranking.map((r) => {
              const rankClass =
                r.rank === 1
                  ? styles.rank1
                  : r.rank === 2
                  ? styles.rank2
                  : r.rank === 3
                  ? styles.rank3
                  : styles.rankOther;
              const isCurrent = r.storeName.includes('本店');
              return (
                <View
                  key={r.storeName}
                  className={classnames(styles.rankItem, isCurrent && styles.currentStore)}
                >
                  <View className={classnames(styles.rankNum, rankClass)}>{r.rank}</View>
                  <View className={styles.rankStore}>
                    <Text className={styles.rankName}>
                      {r.storeName}
                      {isCurrent && (
                        <Text
                          style={{
                            fontSize: '22rpx',
                            marginLeft: '8rpx',
                            padding: '2rpx 10rpx',
                            background: '#6B5CE7',
                            color: '#fff',
                            borderRadius: '8rpx',
                          }}
                        >
                          本店
                        </Text>
                      )}
                    </Text>
                    <Text className={styles.rankMeta}>平均赔付 ¥{r.avgCompensation.toLocaleString()}</Text>
                  </View>
                  <View className={styles.rankRight}>
                    <Text className={styles.rankRate}>{r.resolvedRate}%</Text>
                    <Text className={styles.rankCount}>{r.complaintCount} 件客诉</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>📊</Text>客诉项目占比
        </Text>
        <View className={styles.card}>
          <View className={styles.chartSection}>
            {projectStats.map((p, idx) => (
              <View key={p.name} className={styles.chartItem}>
                <View className={styles.chartHeader}>
                  <Text className={styles.chartLabel}>{p.name}</Text>
                  <Text className={styles.chartValue}>
                    {p.count}件 · {p.percentage}%
                  </Text>
                </View>
                <View className={styles.chartBar}>
                  <View
                    className={styles.chartFill}
                    style={{
                      width: `${p.percentage}%`,
                      background: `linear-gradient(90deg, ${chartColors[idx % chartColors.length]}, ${
                        chartColors[(idx + 1) % chartColors.length]
                      })`,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>👥</Text>员工关联情况
        </Text>
        <View className={styles.card}>
          <View className={styles.staffList}>
            {staffStats.map((s) => {
              const rate = s.complaintCount > 0 ? Math.round((s.resolvedCount / s.complaintCount) * 100) : 0;
              return (
                <View key={s.id} className={styles.staffItem}>
                  <Image
                    className={styles.staffAvatar}
                    src={`https://picsum.photos/id/${parseInt(s.id.slice(1))}/200/200`}
                    mode="aspectFill"
                  />
                  <View className={styles.staffInfo}>
                    <View className={styles.staffName}>
                      <Text>{s.name}</Text>
                      <Text className={styles.staffRole}>{roleLabel[s.role] || s.role}</Text>
                    </View>
                    <Text className={styles.staffMeta}>
                      关联客诉 {s.complaintCount} 件，已解决 {s.resolvedCount} 件
                    </Text>
                  </View>
                  <Text className={styles.staffRate}>{rate}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RankingPage;
