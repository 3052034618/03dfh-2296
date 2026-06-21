import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Input, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useComplaintStore } from '@/store/useComplaintStore';

const CustomerSearchPage: React.FC = () => {
  const router = useRouter();
  const { customers, setDraftCustomer } = useComplaintStore();
  const selectMode = router.params.selectMode === '1';

  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    if (!keyword.trim()) return customers;
    const kw = keyword.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(kw) || c.phone.includes(kw)
    );
  }, [keyword, customers]);

  const handleScan = () => {
    console.log('[CustomerSearch] Scan');
    Taro.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        console.log('[CustomerSearch] Scan result:', res.result);
        Taro.showToast({ title: '已识别顾客', icon: 'success' });
      },
      fail: (err) => {
        console.error('[CustomerSearch] Scan failed:', err);
        Taro.showToast({ title: '扫码失败', icon: 'none' });
      },
    });
  };

  const handleSelect = (customer: typeof customers[0]) => {
    console.log('[CustomerSearch] Select customer:', customer.id);
    if (selectMode) {
      setDraftCustomer(customer);
      Taro.showToast({ title: `已选择 ${customer.name}`, icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 500);
    } else {
      Taro.showToast({ title: `查看 ${customer.name}`, icon: 'none' });
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchInputWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            placeholder="搜索顾客姓名或手机号"
            confirmType="search"
            focus
          />
        </View>
        <Button className={styles.scanBtn} onClick={handleScan}>
          <Text>📷</Text>扫码
        </Button>
      </View>

      <View className={styles.resultSection}>
        <Text className={styles.sectionTitle}>
          {keyword ? `搜索结果（${filtered.length}）` : '最近到店顾客'}
        </Text>

        {filtered.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🔍</Text>
            <Text className={styles.emptyText}>未找到匹配的顾客</Text>
          </View>
        ) : (
          filtered.map((c) => (
            <View key={c.id} className={styles.customerItem}>
              <Image className={styles.customerAvatar} src={c.avatar} mode="aspectFill" />
              <View className={styles.customerInfo}>
                <View className={styles.customerName}>
                  <Text>{c.name}</Text>
                  <Text className={styles.levelBadge}>{c.memberLevel}</Text>
                </View>
                <View className={styles.customerMeta}>
                  <Text>{c.phone}</Text>
                </View>
                <View className={styles.customerMeta}>
                  <Text>最近到店 {c.lastVisitDate}</Text>
                  <Text>　累计消费 ¥{c.totalConsumption.toLocaleString()}</Text>
                </View>
              </View>
              <Button className={styles.selectBtn} onClick={() => handleSelect(c)}>
                {selectMode ? '选择' : '查看'}
              </Button>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default CustomerSearchPage;
