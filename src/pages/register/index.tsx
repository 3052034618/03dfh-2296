import React, { useState } from 'react';
import { View, Text, Image, Button, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useComplaintStore } from '@/store/useComplaintStore';
import TagSelector from '@/components/TagSelector';
import type { Complaint, PhotoRecord } from '@/types/complaint';

const roleLabel: Record<string, string> = {
  consultant: '咨询师',
  doctor: '医生',
  nurse: '护士',
};

const RegisterPage: React.FC = () => {
  const {
    currentDraft,
    staffList,
    setDraftCustomer,
    toggleDraftTag,
    setDraftStatement,
    addDraftPhoto,
    removeDraftPhoto,
    toggleDraftStaff,
    resetDraft,
    addComplaint,
  } = useComplaintStore();

  const [isRecording, setIsRecording] = useState(false);

  const handleSearchCustomer = () => {
    console.log('[Register] Navigate to customer search');
    Taro.navigateTo({ url: '/pages/customer-search/index?selectMode=1' });
  };

  const handleScan = () => {
    console.log('[Register] Scan customer QR code');
    Taro.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        console.log('[Register] Scan result:', res.result);
        Taro.showToast({ title: '已识别顾客信息', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Register] Scan failed:', err);
        Taro.showToast({ title: '扫码失败', icon: 'none' });
      },
    });
  };

  const handleVoiceRecord = () => {
    console.log('[Register] Toggle voice recording:', !isRecording);
    setIsRecording(!isRecording);
    if (!isRecording) {
      Taro.showToast({ title: '开始录音...', icon: 'none', duration: 1500 });
    } else {
      setTimeout(() => {
        setDraftStatement(
          currentDraft.customerStatement +
            (currentDraft.customerStatement ? '\n' : '') +
            '【语音转文字】顾客表示对本次项目效果不太满意，希望能与医生进一步沟通解决方案。'
        );
        Taro.showToast({ title: '已转换为文字', icon: 'success' });
      }, 500);
    }
  };

  const handleAddPhoto = () => {
    console.log('[Register] Add photo');
    Taro.chooseImage({
      count: 3,
      success: (res) => {
        console.log('[Register] Photos selected:', res.tempFilePaths);
        res.tempFilePaths.forEach((path, idx) => {
          const photo: PhotoRecord = {
            id: `photo_${Date.now()}_${idx}`,
            url: path,
            light: '自然光',
            angle: '正面',
            photographer: '当前店长',
            remark: '',
          };
          addDraftPhoto(photo);
        });
        Taro.showToast({ title: '照片已添加', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Register] Choose image failed:', err);
      },
    });
  };

  const handleSubmit = () => {
    if (!currentDraft.customer) {
      Taro.showToast({ title: '请先选择顾客', icon: 'none' });
      return;
    }
    if (currentDraft.tags.length === 0) {
      Taro.showToast({ title: '请选择客诉类型', icon: 'none' });
      return;
    }
    if (!currentDraft.customerStatement.trim()) {
      Taro.showToast({ title: '请记录顾客表述', icon: 'none' });
      return;
    }

    console.log('[Register] Submit complaint draft');
    const newComplaint: Complaint = {
      id: `cp_${Date.now()}`,
      customerId: currentDraft.customer.id,
      customer: currentDraft.customer,
      tags: currentDraft.tags,
      customerStatement: currentDraft.customerStatement,
      photos: currentDraft.photos,
      involvedStaff: currentDraft.involvedStaff,
      compensation: currentDraft.compensation,
      steps: currentDraft.steps.map((s) => ({ ...s, completed: s.key === 'appease' ? true : s.completed })),
      customerConfirmed: false,
      needCallback: true,
      callbackDate: '2026-06-23',
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN'),
    };

    addComplaint(newComplaint);
    resetDraft();

    Taro.showModal({
      title: '登记成功',
      content: '客诉已登记，是否立即前往赔付确认？',
      confirmText: '去确认',
      cancelText: '暂不',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/confirm/index' });
        } else {
          Taro.switchTab({ url: '/pages/today/index' });
        }
      },
    });
  };

  const handleChangeCustomer = () => {
    setDraftCustomer(null);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>👤</Text>顾客信息
        </Text>

        <View className={styles.customerCard}>
          {!currentDraft.customer ? (
            <View className={styles.customerEmpty}>
              <View className={styles.emptyIcon}>
                <Text>👥</Text>
              </View>
              <Text className={styles.emptyText}>请选择或扫码识别顾客</Text>
              <View className={styles.customerBtns}>
                <Button className={styles.btnOutline} onClick={handleSearchCustomer}>
                  🔍 手动搜索
                </Button>
                <Button className={styles.btnOutline} onClick={handleScan}>
                  📷 扫码识别
                </Button>
              </View>
            </View>
          ) : (
            <View className={styles.customerInfo}>
              <Image
                className={styles.customerAvatar}
                src={currentDraft.customer.avatar}
                mode="aspectFill"
              />
              <View className={styles.customerDetail}>
                <View className={styles.customerName}>
                  <Text>{currentDraft.customer.name}</Text>
                  <Text className={styles.levelBadge}>{currentDraft.customer.memberLevel}</Text>
                </View>
                <View className={styles.customerMeta}>
                  <Text>{currentDraft.customer.phone}</Text>
                  <Text>　累计消费 ¥{currentDraft.customer.totalConsumption.toLocaleString()}</Text>
                </View>
                <View className={styles.customerMeta}>
                  <Text>最近到店：{currentDraft.customer.lastVisitDate}</Text>
                </View>
              </View>
              <Button className={styles.changeBtn} onClick={handleChangeCustomer}>
                更换
              </Button>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>🏷️</Text>客诉类型
        </Text>
        <View className={styles.inputCard}>
          <TagSelector selected={currentDraft.tags} onToggle={toggleDraftTag} />
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>💬</Text>顾客表述
        </Text>
        <View className={styles.inputCard}>
          <View className={styles.textareaWrap}>
            <Textarea
              className={styles.textarea}
              value={currentDraft.customerStatement}
              onInput={(e) => setDraftStatement(e.detail.value)}
              placeholder="请记录顾客现场表述，可点击右侧麦克风语音输入"
              autoHeight
              maxlength={1000}
            />
            <View
              className={classnames(styles.voiceBtn, isRecording && styles.recording)}
              onClick={handleVoiceRecord}
            >
              <Text>{isRecording ? '🔴' : '🎤'}</Text>
            </View>
          </View>
          <Text className={styles.voiceTip}>
            💡 点击麦克风可语音转文字快速记录，已输入 {currentDraft.customerStatement.length}/1000 字
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>📷</Text>现场留证
        </Text>
        <View className={styles.inputCard}>
          <View className={styles.photoList}>
            {currentDraft.photos.map((p) => (
              <View key={p.id} className={styles.photoItem}>
                <Image className={styles.photoImg} src={p.url} mode="aspectFill" />
                <View className={styles.photoRemove} onClick={() => removeDraftPhoto(p.id)}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            <View className={styles.photoAdd} onClick={handleAddPhoto}>
              <Text className={styles.addIcon}>+</Text>
              <Text className={styles.addText}>拍照/相册</Text>
            </View>
          </View>
          <Text className={styles.voiceTip} style={{ marginTop: '24rpx' }}>
            💡 建议从正面、侧面多角度拍摄，并备注光线条件和拍摄人
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>📞</Text>一键呼叫
        </Text>
        <View className={styles.inputCard}>
          <Text className={styles.tagLabel}>选择共同参与协商的人员（可多选）</Text>
          <View className={styles.staffList}>
            {staffList.map((s) => {
              const selected = currentDraft.involvedStaff.some((i) => i.id === s.id);
              return (
                <View
                  key={s.id}
                  className={classnames(styles.staffItem, selected && styles.selected)}
                  onClick={() => toggleDraftStaff(s)}
                >
                  <Image className={styles.staffAvatar} src={s.avatar} mode="aspectFill" />
                  <Text className={styles.staffName}>{s.name}</Text>
                  <Text className={styles.staffRole}>{roleLabel[s.role]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View className={styles.fixedFooter}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          提交登记
        </Button>
      </View>
    </ScrollView>
  );
};

export default RegisterPage;
