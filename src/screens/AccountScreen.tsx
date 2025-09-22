import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppStateContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

const AccountScreen: React.FC<Props> = () => {
  const { account, updateAccount } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ChatGPTアカウント情報の管理</Text>
      <Text style={[styles.description, styles.sectionSpacing]}>
        この画面では、利用中のChatGPTアカウントに関するメモを残せます。
        入力した情報は端末内でのみ利用され、外部には送信されません。
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>呼び名</Text>
        <TextInput
          style={styles.input}
          placeholder="チーム内での識別名"
          value={account.nickname}
          onChangeText={(value) => updateAccount({ nickname: value })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>ログイン用メールアドレス</Text>
        <TextInput
          style={styles.input}
          placeholder="example@example.com"
          value={account.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value) => updateAccount({ email: value })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>APIキー（必要な場合）</Text>
        <TextInput
          style={styles.input}
          placeholder="sk-..."
          value={account.apiKey}
          onChangeText={(value) => updateAccount({ apiKey: value })}
          autoCapitalize="none"
          secureTextEntry
        />
        <Text style={styles.helperText}>
          APIキーは必要なときだけ入力し、不要になったら削除してください。
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>備考</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="契約プランや注意事項などのメモ"
          value={account.note}
          onChangeText={(value) => updateAccount({ note: value })}
          multiline
        />
      </View>

      <View style={[styles.warningBox, styles.sectionSpacingLarge]}>
        <Text style={styles.warningTitle}>セキュリティ注意</Text>
        <Text style={styles.warningText}>
          このアプリはアカウント情報をオンライン送信しませんが、共有端末では個人情報の保存を避けてください。
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  sectionSpacing: {
    marginTop: 16,
  },
  sectionSpacingLarge: {
    marginTop: 24,
  },
  formGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#0f172a',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 18,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#facc15',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
    marginTop: 6,
  },
});

export default AccountScreen;
