import React, { useState } from 'react';
import { View, Text, Image, Button, Textarea, Input, ScrollView } from '@tarojs/components';
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
    customers,
    setDraftCustomer,
    toggleDraftTag,
    setDraftStatement,
    addDraftPhoto,
    removeDraftPhoto,
    updateDraftPhoto,
    toggleDraftStaff,
    callDraftStaff,
    setDraftStaffNote,
    resetDraft,
    addComplaint,
  } = useComplaintStore();

  const [isRecording, setIsRecording] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPhotoFields, setEditPhotoFields] = useState<{
    light: string;
    angle: string;
    photographer: string;
    remark: string;
  }>({ light: '', angle: '', photographer: '', remark: '' });

  const handleSearchCustomer = () => {
    Taro.navigateTo({ url: '/pages/customer-search/index?selectMode=1' });
  };

  const handleScan = () => {
    Taro.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        const scanResult = res.result;
        const matched = customers.find(
          (c) => c.id === scanResult || c.phone === scanResult || scanResult.includes(c.id)
        );
        if (matched) {
          setDraftCustomer(matched);
          Taro.showToast({ title: `已识别：${matched.name}`, icon: 'success' });
        } else {
          Taro.showModal({
            title: '未找到顾客',
            content: `扫码内容"${scanResult}"未匹配到任何顾客档案，请确认二维码是否正确，或使用手动搜索。`,
            confirmText: '手动搜索',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                handleSearchCustomer();
              }
            },
          });
        }
      },
      fail: () => {
        Taro.showToast({ title: '扫码失败，请重试', icon: 'none' });
      },
    });
  };

  const handleVoiceRecord = () => {
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
    Taro.chooseImage({
      count: 3,
      success: (res) => {
        res.tempFilePaths.forEach((path, idx) => {
          const photo: PhotoRecord = {
            id: `photo_${Date.now()}_${idx}`,
            url: path,
            light: '自然光',
            angle: '正面',
            photographer: '',
            remark: '',
          };
          addDraftPhoto(photo);
        });
        Taro.showToast({ title: '照片已添加', icon: 'success' });
      },
    });
  };

  const handleEditPhoto = (photo: PhotoRecord) => {
    setEditingPhotoId(photo.id);
    setEditPhotoFields({
      light: photo.light,
      angle: photo.angle,
      photographer: photo.photographer,
      remark: photo.remark,
    });
  };

  const handleSavePhotoEdit = () => {
    if (editingPhotoId) {
      updateDraftPhoto(editingPhotoId, editPhotoFields);
      setEditingPhotoId(null);
      Taro.showToast({ title: '照片信息已保存', icon: 'success' });
    }
  };

  const handleCallStaff = (staffId: string) => {
    callDraftStaff(staffId);
    Taro.showToast({ title: '已呼叫，请等待回复', icon: 'success' });
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
      callbackDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
              <View key={p.id}>
                <View className={styles.photoItem}>
                  <Image className={styles.photoImg} src={p.url} mode="aspectFill" />
                  <View className={styles.photoRemove} onClick={() => removeDraftPhoto(p.id)}>
                    <Text>×</Text>
                  </View>
                  <View className={styles.photoEditBtn} onClick={() => handleEditPhoto(p)}>
                    <Text>✏</Text>
                  </View>
                </View>
                {editingPhotoId === p.id && (
                  <View className={styles.photoEditPanel}>
                    <View className={styles.photoEditRow}>
                      <Text className={styles.photoEditLabel}>光线</Text>
                      <Input
                        className={styles.photoEditInput}
                        value={editPhotoFields.light}
                        onInput={(e) => setEditPhotoFields({ ...editPhotoFields, light: e.detail.value })}
                        placeholder="如：自然光/室内冷光"
                      />
                    </View>
                    <View className={styles.photoEditRow}>
                      <Text className={styles.photoEditLabel}>角度</Text>
                      <Input
                        className={styles.photoEditInput}
                        value={editPhotoFields.angle}
                        onInput={(e) => setEditPhotoFields({ ...editPhotoFields, angle: e.detail.value })}
                        placeholder="如：正面/45度侧面"
                      />
                    </View>
                    <View className={styles.photoEditRow}>
                      <Text className={styles.photoEditLabel}>拍摄人</Text>
                      <Input
                        className={styles.photoEditInput}
                        value={editPhotoFields.photographer}
                        onInput={(e) => setEditPhotoFields({ ...editPhotoFields, photographer: e.detail.value })}
                        placeholder="如：张护士长"
                      />
                    </View>
                    <View className={styles.photoEditRow}>
                      <Text className={styles.photoEditLabel}>备注</Text>
                      <Input
                        className={styles.photoEditInput}
                        value={editPhotoFields.remark}
                        onInput={(e) => setEditPhotoFields({ ...editPhotoFields, remark: e.detail.value })}
                        placeholder="照片说明"
                      />
                    </View>
                    <Button
                      className={styles.btnOutline}
                      style={{ marginTop: '12rpx', fontSize: '24rpx' }}
                      onClick={handleSavePhotoEdit}
                    >
                      保存
                    </Button>
                  </View>
                )}
              </View>
            ))}
            <View className={styles.photoAdd} onClick={handleAddPhoto}>
              <Text className={styles.addIcon}>+</Text>
              <Text className={styles.addText}>拍照/相册</Text>
            </View>
          </View>
          <Text className={styles.voiceTip} style={{ marginTop: '24rpx' }}>
            💡 点击照片上的 ✏ 可编辑光线、角度、拍摄人等信息
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>📞</Text>一键呼叫
        </Text>
        <View className={styles.inputCard}>
          <Text className={styles.tagLabel}>选择并呼叫共同参与协商的人员</Text>
          <View className={styles.staffList}>
            {staffList.map((s) => {
              const record = currentDraft.involvedStaff.find((r) => r.staff.id === s.id);
              const selected = !!record;
              return (
                <View
                  key={s.id}
                  className={classnames(styles.staffItem, selected && styles.selected)}
                >
                  <Image className={styles.staffAvatar} src={s.avatar} mode="aspectFill" />
                  <View className={styles.staffInfo}>
                    <View className={styles.staffNameRow}>
                      <Text className={styles.staffName}>{s.name}</Text>
                      <Text className={styles.staffRole}>{roleLabel[s.role]}</Text>
                      {record?.called && <Text className={styles.staffCalledBadge}>已呼叫</Text>}
                    </View>
                    {selected && (
                      <Input
                        className={styles.staffNoteInput}
                        value={record?.supplementNote || ''}
                        onInput={(e) => setDraftStaffNote(s.id, e.detail.value)}
                        placeholder="补充说明（如：确认恢复情况、协助沟通方案）"
                      />
                    )}
                  </View>
                  {selected && !record?.called && (
                    <Button
                      className={classnames(styles.callBtn, styles.notCalled)}
                      onClick={() => handleCallStaff(s.id)}
                    >
                      呼叫
                    </Button>
                  )}
                  {selected && record?.called && (
                    <Button
                      className={classnames(styles.callBtn, styles.called)}
                      onClick={() => toggleDraftStaff(s)}
                    >
                      移除
                    </Button>
                  )}
                  {!selected && (
                    <Button
                      className={classnames(styles.callBtn, styles.notCalled)}
                      onClick={() => toggleDraftStaff(s)}
                    >
                      添加
                    </Button>
                  )}
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
