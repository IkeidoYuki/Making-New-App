import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../context/AppStateContext';
import { buildPrompt, PromptBuilderInput } from '../utils/prompt';

type Props = NativeStackScreenProps<RootStackParamList, 'PromptBuilder'>;

const DOMAIN_OPTIONS = [
  'IT',
  '製造',
  '金融',
  '小売',
  '医療',
  '教育',
  '建設',
  '物流',
  '公共',
  'エネルギー',
  '飲食',
  '旅行',
  'メディア',
  'プロサービス',
  'その他',
];

const PromptBuilderScreen: React.FC<Props> = ({ navigation }) => {
  const { promptResult, setPromptResult } = useAppState();

  const [domainCategory, setDomainCategory] = React.useState('');
  const [domainDetail, setDomainDetail] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [additionalInfo, setAdditionalInfo] = React.useState('');

  React.useEffect(() => {
    if (promptResult) {
      setDomainCategory(promptResult.input.domainCategory);
      setDomainDetail(promptResult.input.domainDetail);
      setIndustry(promptResult.input.industry);
      setAdditionalInfo(promptResult.input.additionalInfo);
    }
  }, [promptResult]);

  const handleSelectDomain = React.useCallback((option: string) => {
    setDomainCategory(option);
    if (option !== 'その他') {
      setDomainDetail('');
    }
  }, []);

  const handleGenerate = React.useCallback(() => {
    if (!domainCategory) {
      Alert.alert('テーマ・領域を選択してください');
      return;
    }

    if (domainCategory === 'その他' && !domainDetail.trim()) {
      Alert.alert('その他を選択した場合、具体的な領域を記入してください');
      return;
    }

    const input: PromptBuilderInput = {
      domainCategory,
      domainDetail,
      industry,
      additionalInfo,
    };

    const result = buildPrompt(input);
    setPromptResult(result);
    navigation.navigate('Main');
  }, [
    domainCategory,
    domainDetail,
    industry,
    additionalInfo,
    setPromptResult,
    navigation,
  ]);

  const domainDisplay =
    domainCategory === 'その他' && domainDetail.trim()
      ? domainDetail.trim()
      : domainCategory || '（領域未選択）';

  const industryDisplay = industry.trim()
    ? industry.trim().endsWith('業界')
      ? industry.trim()
      : `${industry.trim()}業界`
    : '想定業界';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>質問内容のヒアリング</Text>
      <Text style={[styles.description, styles.marginTopSmall]}>
        以下の項目を入力すると、AIに与えるロール指示と質問テンプレートを生成します。
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>テーマ・領域</Text>
        <View style={styles.optionList}>
          {DOMAIN_OPTIONS.map((option) => {
            const isSelected = domainCategory === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.optionChip,
                  isSelected && styles.optionChipSelected,
                ]}
                onPress={() => handleSelectDomain(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    isSelected && styles.optionChipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {domainCategory === 'その他' && (
          <TextInput
            style={[styles.input, styles.marginTopSmall]}
            placeholder="想定している領域を詳しく記入してください"
            value={domainDetail}
            onChangeText={setDomainDetail}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>想定している業界（任意）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="業界が決まっていれば入力してください"
          value={industry}
          onChangeText={setIndustry}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>主な実施タスク</Text>
        <View style={styles.readonlyBox}>
          <Text style={styles.readonlyText}>AIは以下を実施します：</Text>
          <Text style={styles.readonlyText}>
            ・{domainDisplay}全般に関する知見に基づき、業界特性を踏まえた技術回答の作成
          </Text>
          <Text style={styles.readonlyText}>
            ・現場で生じるQ&A対応、トラブル調査、運用手順のアドバイス
          </Text>
          <Text style={styles.readonlyText}>
            ・{industryDisplay}に求められるセキュリティ基準・コンプライアンス要件の助言
          </Text>
          <Text style={styles.readonlyText}>
            ・最新のアップデートや推奨アーキテクチャの情報提供
          </Text>
          <Text style={styles.readonlyText}>
            ・入力された質問内容に応じて、関連資料・サンプル構成
          </Text>
          <Text style={styles.readonlyText}>・注意事項も付与</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.sectionLabel}>AIに知っておいてほしい情報（任意・URLも可）</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="共有したい補足情報や参考URLがあれば入力してください"
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
        />
      </View>

      <Pressable style={[styles.primaryButton, styles.marginTopSmall]} onPress={handleGenerate}>
        <Text style={styles.primaryButtonText}>ロールプロンプトを生成する</Text>
      </Pressable>

      {promptResult && (
        <View style={[styles.previewCard, styles.marginTopLarge]}>
          <Text style={styles.previewTitle}>生成済みのロールプロンプト</Text>
          <Text style={styles.previewSummary}>{promptResult.summary}</Text>
          <Text style={styles.previewBody}>{promptResult.rolePrompt}</Text>
          <Pressable
            style={[styles.secondaryButton, styles.marginTopSmall]}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.secondaryButtonText}>メイン画面で確認する</Text>
          </Pressable>
        </View>
      )}
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
  marginTopSmall: {
    marginTop: 16,
  },
  marginTopLarge: {
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
  sectionLabel: {
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
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#ffffff',
    flexBasis: '48%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChipSelected: {
    backgroundColor: '#2563eb11',
    borderColor: '#2563eb',
  },
  optionChipText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
    textAlign: 'center',
  },
  optionChipTextSelected: {
    color: '#1d4ed8',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  previewSummary: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
  },
  previewBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#2563eb11',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 14,
  },
  readonlyBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  readonlyText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
});

export default PromptBuilderScreen;
