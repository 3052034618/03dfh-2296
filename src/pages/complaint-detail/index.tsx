import React, { useState } from 'react';
import { View, Text, Image, Button, Input, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useComplaintStore } from '@/store/useComplaintStore';
import StepIndicator from '@/components/StepIndicator';

const roleLabel: Record<string, string> = {
  consultant: '咨询师',
  doctor: '医生',
  nurse: '护士',
};

const statusMap = {
  pending: { text: '待处理', className: styles.statusPending },
  processing: { text: '处理中', className: styles.statusProcessing },
  done: { text: '已完成', className: styles.statusDone },
};

const ComplaintDetailPage: React.FC = () => {
  const router = useRouter();
  const {
    getComplaintById,
    tagOptions,
    updateComplaintStep,
    confirmComplaint,
    callComplaintStaff,
    setComplaintStaffNote,
  } = useComplaintStore();
  const id = router.params.id || '';
  const complaint = getComplaintById(id);

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffNoteInput, setStaffNoteInput] = useState('');

  React.useEffect(() => {
    if (!complaint) {
      console.error('[ComplaintDetail] Complaint not found:', id);
    }
  }, [id, complaint]);

  if (!complaint) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View style={{ padding: '120rpx 0', textAlign: 'center' }}>
          <Text style={{ fontSize: '96rpx', opacity: 0.4, marginBottom: '24rpx' }}>😕</Text>
          <Text style={{ color: '#9CA3AF', fontSize: '28rpx' }}>未找到该客诉记录</Text>
        </View>
      </ScrollView>
    );
  }

  const statusInfo = statusMap[complaint.status];

  const handleGoConfirm = () => {
    Taro.switchTab({ url: '/pages/confirm/index' });
  };

  const handleStepClick = (key: 'appease' | 'recheck' | 'discuss') => {
    updateComplaintStep(complaint.id, key);
  };

  const handleCustomerConfirm = () => {
    Taro.showModal({
      title: '顾客确认',
      content: '请由顾客亲自点击确认，表示已知悉并接受解释或赔付方案。',
      confirmText: '顾客确认',
      success: (res) => {
        if (res.confirm) {
          confirmComplaint(complaint.id);
          Taro.showToast({ title: '确认成功', icon: 'success' });
        }
      },
    });
  };

  const handleCallStaff = (staffId: string) => {
    callComplaintStaff(complaint.id, staffId);
    Taro.showToast({ title: '已呼叫', icon: 'success' });
  };

  const handleSaveStaffNote = (staffId: string) => {
    setComplaintStaffNote(complaint.id, staffId, staffNoteInput);
    setEditingStaffId(null);
    Taro.showToast({ title: '补充说明已保存', icon: 'success' });
  };

  const handleEditStaffNote = (staffId: string, currentNote: string) => {
    setEditingStaffId(staffId);
    setStaffNoteInput(currentNote);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <View className={styles.card}>
          <View className={styles.customerHeader}>
            <Image
              className={styles.customerAvatar}
              src={complaint.customer.avatar}
              mode="aspectFill"
            />
            <View className={styles.customerInfo}>
              <View className={styles.customerName}>
                <Text>{complaint.customer.name}</Text>
                <Text className={styles.levelBadge}>{complaint.customer.memberLevel}</Text>
              </View>
              <View className={styles.customerMeta}>
                <Text>{complaint.customer.phone}</Text>
              </View>
              <View className={styles.customerMeta}>
                <Text>累计消费 ¥{complaint.customer.totalConsumption.toLocaleString()}</Text>
                <Text>　最近到店 {complaint.customer.lastVisitDate}</Text>
              </View>
            </View>
            <Text className={classnames(styles.statusBadge, statusInfo.className)}>
              {statusInfo.text}
            </Text>
          </View>

          <View className={styles.tagList}>
            {complaint.tags.map((tag) => {
              const opt = tagOptions.find((t) => t.value === tag);
              return (
                <Text
                  key={tag}
                  className={styles.tag}
                  style={{
                    backgroundColor: opt ? `${opt.color}15` : '#F3F4F6',
                    color: opt?.color || '#6B7280',
                  }}
                >
                  {opt?.label || tag}
                </Text>
              );
            })}
          </View>

          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>关联项目</Text>
            <Text className={styles.metaValue}>{complaint.relatedProject || '未关联'}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>登记时间</Text>
            <Text className={styles.metaValue}>{complaint.createTime}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaLabel}>顾客确认</Text>
            <Text className={styles.metaValue} style={{ color: complaint.customerConfirmed ? '#22C55E' : '#F97316' }}>
              {complaint.customerConfirmed ? '已确认' : '待确认'}
            </Text>
          </View>
          {complaint.needCallback && (
            <View className={styles.metaRow}>
              <Text className={styles.metaLabel}>回访日期</Text>
              <Text className={styles.metaValue}>{complaint.callbackDate}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>📝</Text>顾客表述
        </Text>
        <View className={styles.card}>
          <View className={styles.statementBox}>{complaint.customerStatement}</View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>🔄</Text>处理进度
        </Text>
        <View className={styles.card}>
          <StepIndicator
            steps={complaint.steps}
            clickable
            onClick={handleStepClick}
          />
        </View>
      </View>

      {complaint.photos.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>📷</Text>现场照片（{complaint.photos.length}）
          </Text>
          <View className={styles.card}>
            <View className={styles.photoGrid}>
              {complaint.photos.map((p) => (
                <View key={p.id} className={styles.photoItem}>
                  <Image className={styles.photoImg} src={p.url} mode="aspectFill" />
                  <View className={styles.photoInfo}>
                    <Text className={styles.photoInfoText}>
                      {p.angle} · {p.light}
                    </Text>
                    {p.photographer && (
                      <Text className={styles.photoInfoText}>
                        拍摄：{p.photographer}
                      </Text>
                    )}
                    {p.remark && (
                      <Text className={styles.photoInfoText}>
                        {p.remark}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {complaint.involvedStaff.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>👥</Text>参与人员（{complaint.involvedStaff.length}）
          </Text>
          <View className={styles.card}>
            <View className={styles.staffList}>
              {complaint.involvedStaff.map((r) => (
                <View key={r.staff.id} className={styles.staffItem}>
                  <Image className={styles.staffAvatar} src={r.staff.avatar} mode="aspectFill" />
                  <View className={styles.staffContent}>
                    <View className={styles.staffNameRow}>
                      <Text className={styles.staffName}>
                        {r.staff.name}（{roleLabel[r.staff.role]}）
                      </Text>
                      {r.called ? (
                        <Text className={styles.staffCalled}>已呼叫 {r.callTime}</Text>
                      ) : (
                        <Button
                          className={styles.staffCallBtn}
                          onClick={() => handleCallStaff(r.staff.id)}
                        >
                          呼叫
                        </Button>
                      )}
                    </View>
                    {r.supplementNote && editingStaffId !== r.staff.id && (
                      <Text className={styles.staffNote}
                        onClick={() => handleEditStaffNote(r.staff.id, r.supplementNote)}
                      >
                        📋 {r.supplementNote}
                      </Text>
                    )}
                    {!r.supplementNote && editingStaffId !== r.staff.id && r.called && (
                      <Text className={styles.staffNotePlaceholder}
                        onClick={() => handleEditStaffNote(r.staff.id, '')}
                      >
                        点击补充说明...
                      </Text>
                    )}
                    {editingStaffId === r.staff.id && (
                      <View className={styles.staffNoteEdit}>
                        <Input
                          className={styles.staffNoteInput}
                          value={staffNoteInput}
                          onInput={(e) => setStaffNoteInput(e.detail.value)}
                          placeholder="输入补充说明"
                          autoFocus
                        />
                        <Button
                          className={styles.staffNoteSave}
                          onClick={() => handleSaveStaffNote(r.staff.id)}
                        >
                          保存
                        </Button>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>💰</Text>赔付方案
        </Text>
        <View className={styles.card}>
          <View className={styles.compList}>
            {complaint.compensation.maxRefund > 0 && (
              <View className={styles.compItem}>
                <Text className={styles.compIcon}>💵</Text>
                <View className={styles.compContent}>
                  <Text className={styles.compType}>现金退款</Text>
                  <Text className={styles.compValue} style={{ color: '#EF4444' }}>
                    ¥{complaint.compensation.maxRefund.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
            {complaint.compensation.freeItems.length > 0 && (
              <View className={styles.compItem}>
                <Text className={styles.compIcon}>🎁</Text>
                <View className={styles.compContent}>
                  <Text className={styles.compType}>免费项目</Text>
                  <Text className={styles.compValue}>
                    {complaint.compensation.freeItems.join('、')}
                  </Text>
                </View>
              </View>
            )}
            {complaint.compensation.discount > 0 && (
              <View className={styles.compItem}>
                <Text className={styles.compIcon}>🏷️</Text>
                <View className={styles.compContent}>
                  <Text className={styles.compType}>折扣优惠</Text>
                  <Text className={styles.compValue}>
                    {(complaint.compensation.discount * 10).toFixed(1)}折
                  </Text>
                </View>
              </View>
            )}
            {complaint.compensation.gifts.length > 0 && (
              <View className={styles.compItem}>
                <Text className={styles.compIcon}>🎀</Text>
                <View className={styles.compContent}>
                  <Text className={styles.compType}>赠品</Text>
                  <Text className={styles.compValue}>
                    {complaint.compensation.gifts.join('、')}
                  </Text>
                </View>
              </View>
            )}
            {complaint.compensation.maxRefund === 0 &&
              complaint.compensation.freeItems.length === 0 &&
              complaint.compensation.discount === 0 &&
              complaint.compensation.gifts.length === 0 && (
                <Text style={{ color: '#9CA3AF', textAlign: 'center', padding: '24rpx 0' }}>
                  暂未设置赔付方案
                </Text>
              )}
          </View>
        </View>
      </View>

      <View className={styles.fixedFooter}>
        <Button className={styles.btnSecondary} onClick={handleGoConfirm}>
          编辑方案
        </Button>
        <Button
          className={styles.btnPrimary}
          disabled={complaint.customerConfirmed}
          onClick={handleCustomerConfirm}
        >
          {complaint.customerConfirmed ? '已确认' : '顾客手机确认'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default ComplaintDetailPage;
