import React, { useState, useMemo } from 'react';
import { View, Text, Button, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useComplaintStore } from '@/store/useComplaintStore';
import StepIndicator from '@/components/StepIndicator';
import type { Complaint } from '@/types/complaint';

const ConfirmPage: React.FC = () => {
  const { complaints, confirmComplaint, updateComplaintStatus } = useComplaintStore();
  const [selectedId, setSelectedId] = useState<string>('');

  const pendingList = useMemo(
    () => complaints.filter((c) => c.status !== 'done' || !c.customerConfirmed),
    [complaints]
  );

  const confirmedList = useMemo(
    () => complaints.filter((c) => c.customerConfirmed),
    [complaints]
  );

  const [tab, setTab] = useState<'pending' | 'done'>('pending');
  const list = tab === 'pending' ? pendingList : confirmedList;
  const current = list.find((c) => c.id === selectedId) || list[0];

  const [needCallback, setNeedCallback] = useState(true);
  const [callbackDate, setCallbackDate] = useState('2026-06-23');
  const [refundInput, setRefundInput] = useState('');

  React.useEffect(() => {
    if (current) {
      setNeedCallback(current.needCallback);
      setCallbackDate(current.callbackDate || '2026-06-23');
      setRefundInput(String(current.compensation.maxRefund));
    }
  }, [current?.id]);

  const toggleStep = (key: 'appease' | 'recheck' | 'discuss') => {
    if (!current) return;
    console.log('[Confirm] Toggle step:', key);
  };

  const handleCustomerConfirm = () => {
    if (!current) return;
    console.log('[Confirm] Request customer confirm for:', current.id);

    Taro.showModal({
      title: '发送顾客确认',
      content: `将向 ${current.customer.name}（${current.customer.phone}）发送赔付方案确认链接，是否继续？`,
      confirmText: '发送',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '发送中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showModal({
              title: '请顾客确认',
              content: '请将手机交给顾客，由顾客亲自确认已收到解释或赔付方案。',
              confirmText: '交给顾客',
              cancelText: '稍后确认',
              success: (r) => {
                if (r.confirm) {
                  Taro.showLoading({ title: '等待确认...' });
                  setTimeout(() => {
                    Taro.hideLoading();
                    confirmComplaint(current.id);
                    Taro.showToast({ title: '顾客已确认', icon: 'success' });
                  }, 1500);
                }
              },
            });
          }, 1000);
        }
      },
    });
  };

  const handleMarkProcessing = () => {
    if (!current) return;
    console.log('[Confirm] Mark processing:', current.id);
    updateComplaintStatus(current.id, 'processing');
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  };

  if (!current) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.title}>赔付确认</Text>
          <Text className={styles.subTitle}>与顾客确认赔付方案</Text>
        </View>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>✅</Text>
          <Text className={styles.emptyText}>暂无需要确认的客诉</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>赔付确认</Text>
        <Text className={styles.subTitle}>与顾客确认赔付方案</Text>
      </View>

      <View className={styles.selectorSection}>
        <View className={styles.tabs}>
          <Text
            className={classnames(styles.tab, tab === 'pending' && styles.active)}
            onClick={() => setTab('pending')}
          >
            待确认 ({pendingList.length})
          </Text>
          <Text
            className={classnames(styles.tab, tab === 'done' && styles.active)}
            onClick={() => setTab('done')}
          >
            已确认 ({confirmedList.length})
          </Text>
        </View>

        {list.length > 1 && (
          <ScrollView scrollX className={{ display: 'flex', gap: '16rpx', marginBottom: '24rpx' }}>
            {list.map((c) => (
              <View
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  padding: '12rpx 24rpx',
                  borderRadius: '48rpx',
                  background: c.id === current.id ? '#6B5CE7' : '#fff',
                  color: c.id === current.id ? '#fff' : '#6B7280',
                  fontSize: '26rpx',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.06)',
                  marginRight: '16rpx',
                  display: 'inline-block',
                }}
              >
                {c.customer.name}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View className={styles.card}>
        <View className={styles.customerBar}>
          <Image className={styles.customerAvatar} src={current.customer.avatar} mode="aspectFill" />
          <View style={{ flex: 1 }}>
            <Text className={styles.customerName}>{current.customer.name}</Text>
            <Text className={styles.customerPhone}>
              {current.customer.phone} · {current.relatedProject || '未关联项目'}
            </Text>
          </View>
          <View
            style={{
              padding: '6rpx 20rpx',
              borderRadius: '48rpx',
              background: current.customerConfirmed
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(249, 115, 22, 0.1)',
              color: current.customerConfirmed ? '#22C55E' : '#F97316',
              fontSize: '24rpx',
              fontWeight: 500,
            }}
          >
            {current.customerConfirmed ? '已确认' : '待确认'}
          </View>
        </View>

        <StepIndicator steps={current.steps} clickable onClick={toggleStep} />
      </View>

      <View className={styles.sectionTitle}>
        <Text>💰</Text>补偿方案（门店权限范围内）
      </View>
      <View className={styles.card}>
        <View className={styles.compRow}>
          <Text className={styles.compLabel}>现金退款上限</Text>
          <View className={styles.inputWrap} style={{ minWidth: '200rpx' }}>
            <Input
              className={styles.inputField}
              type="digit"
              value={refundInput}
              onInput={(e) => setRefundInput(e.detail.value)}
              placeholder="0"
              style={{ textAlign: 'right' }}
            />
          </View>
        </View>
        <View className={styles.compRow}>
          <Text className={styles.compLabel}>免费项目</Text>
          <View className={styles.tagList}>
            {current.compensation.freeItems.length > 0 ? (
              current.compensation.freeItems.map((item, i) => (
                <Text key={i} className={styles.tagItem}>
                  {item}
                </Text>
              ))
            ) : (
              <Text style={{ color: '#9CA3AF', fontSize: '26rpx' }}>暂未设置</Text>
            )}
          </View>
        </View>
        <View className={styles.compRow}>
          <Text className={styles.compLabel}>折扣优惠</Text>
          <Text className={styles.compValue}>
            {current.compensation.discount > 0
              ? `${(current.compensation.discount * 10).toFixed(1)}折`
              : '无'}
          </Text>
        </View>
        <View className={styles.compRow}>
          <Text className={styles.compLabel}>赠品</Text>
          <View className={styles.tagList}>
            {current.compensation.gifts.length > 0 ? (
              current.compensation.gifts.map((g, i) => (
                <Text key={i} className={styles.tagItem}>
                  {g}
                </Text>
              ))
            ) : (
              <Text style={{ color: '#9CA3AF', fontSize: '26rpx' }}>无</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>📞</Text>回访设置
      </View>
      <View className={styles.card}>
        <View className={styles.compRow}>
          <Text className={styles.callbackLabel}>次日回访</Text>
          <Text
            className={classnames(
              styles.callbackSwitch,
              needCallback ? styles.switchOn : styles.switchOff
            )}
            onClick={() => setNeedCallback(!needCallback)}
          >
            {needCallback ? '✓ 已开启' : '已关闭'}
          </Text>
        </View>
        {needCallback && (
          <View className={styles.compRow}>
            <Text className={styles.compLabel}>回访日期</Text>
            <Text className={styles.datePicker}>{callbackDate}</Text>
          </View>
        )}
      </View>

      {!current.customerConfirmed && (
        <View className={styles.confirmCard}>
          <Text className={styles.confirmTitle}>📱 顾客手机确认</Text>
          <Text className={styles.confirmDesc}>
            请让顾客在手机上查看并确认已收到解释或赔付方案，
            {'\n'}
            确认后将完成本次客诉的门店层面处理。
          </Text>
        </View>
      )}

      <View className={styles.fixedFooter}>
        <Button className={styles.btnSecondary} onClick={handleMarkProcessing}>
          标记处理中
        </Button>
        <Button
          className={styles.btnPrimary}
          disabled={current.customerConfirmed}
          onClick={handleCustomerConfirm}
        >
          {current.customerConfirmed ? '顾客已确认' : '发送顾客确认'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default ConfirmPage;
