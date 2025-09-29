import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const PROMPT_TIPS: string[] = [
  '「テーマ・領域」と「興味のある分野」では、取り上げたい技術名や利用シーンなどを具体的に選択・入力すると、指示が専門的になります。',
  '「特に知りたい内容」には課題や確認したい観点、欲しい成果物の形式を箇条書きでまとめると、回答の方向性が定まりやすくなります。',
  '「想定している業界」を書いておくと、対象ユーザーや利用場面が伝わり、業界特有の前提を反映した指示に調整できます。',
  '「主な実施タスク」と「AIに知っておいてほしい情報」には、進めたいステップや既存の資料・制約条件を記載し、背景を共有しましょう。',
];

const HelpScreen: React.FC = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>ヘルプ & チュートリアル</Text>
      <Text style={[styles.description, styles.marginTopSmall]}>
        アプリの使い方と、良い質問を作るためのコツをまとめています。
      </Text>

      <View style={[styles.section, styles.marginTopLarge]}>
        <Text style={styles.sectionTitle}>基本的な使い方</Text>
        <Text style={[styles.paragraph, styles.marginTopSmall]}>1. メイン画面から「ヒアリングシート」を開きます。</Text>
        <Text style={styles.paragraph}>
          2. テーマや特に知りたい内容などを入力して、ルールプロンプトを生成します。
        </Text>
        <Text style={styles.paragraph}>
          想定している業界やAIに知ってほしい情報を追加すると、より要望に沿ったロールテンプレート作成が可能です。
        </Text>
        <Text style={styles.paragraph}>
          3. メイン画面で生成されたロール指示と質問文を確認し、必要に応じて編集します。
        </Text>
        <Text style={styles.paragraph}>
          4. 「ChatGPTを開く」ボタンからブラウザを起動し、プロンプトと質問を貼り付けて利用します。
        </Text>
      </View>

      <View style={[styles.section, styles.marginTopLarge]}>
        <Text style={styles.sectionTitle}>良いロールプロンプトを作るコツ</Text>
        {PROMPT_TIPS.map((tip, index) => (
          <Text
            key={tip}
            style={[
              styles.paragraph,
              index === 0 ? styles.marginTopSmall : undefined,
            ]}
          >
            {`・${tip}`}
          </Text>
        ))}
      </View>

      <View style={[styles.section, styles.marginTopLarge]}>
        <Text style={styles.sectionTitle}>よくある質問</Text>
        <Text style={[styles.paragraph, styles.marginTopSmall]}>
          Q. 生成されたロールプロンプトは自動でChatGPTに送信されますか？
        </Text>
        <Text style={styles.answer}>
          A. いいえ。ユーザー自身でコピー＆ペーストして利用する設計です。
        </Text>
        <Text style={[styles.paragraph, styles.marginTopSmall]}>
          Q. 「ChatGPTに送信する質問内容」に入力した文章はどこに使われますか？
        </Text>
        <Text style={styles.answer}>
          A. 入力するとロールプロンプト内の依頼事項に反映されます。またコピー時には質問文として別枠でも追加されるため、そのまま貼り付けて活用できます。
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
    color: '#475569',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  paragraph: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 6,
  },
  answer: {
    fontSize: 13,
    color: '#1d4ed8',
    lineHeight: 18,
    marginTop: 6,
  },
  marginTopSmall: {
    marginTop: 16,
  },
  marginTopLarge: {
    marginTop: 24,
  },
});

export default HelpScreen;
