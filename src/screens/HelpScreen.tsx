import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const HelpScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ヘルプ & チュートリアル</Text>
      <Text style={[styles.description, styles.marginTopSmall]}>
        アプリの使い方と、良い質問を作るためのコツをまとめています。
      </Text>

      <View style={[styles.section, styles.marginTopLarge]}>
        <Text style={styles.sectionTitle}>基本的な使い方</Text>
        <Text style={[styles.paragraph, styles.marginTopSmall]}>1. メイン画面から「ヒアリングシート」を開きます。</Text>
        <Text style={styles.paragraph}>
          2. テーマ・背景・ゴールなどを入力してロールプロンプトを生成します。
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
        <Text style={[styles.paragraph, styles.marginTopSmall]}>・背景情報は数値や状況を入れて具体的に記載する。</Text>
        <Text style={styles.paragraph}>・期待する成果を明確に（例：アウトライン、コード例、意思決定理由）。</Text>
        <Text style={styles.paragraph}>
          ・回答のトーンや形式を指定すると、アウトプットの再利用性が高まります。
        </Text>
        <Text style={styles.paragraph}>
          ・制約条件や避けたいことを最初に伝えておくと、修正の手間が減ります。
        </Text>
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
          Q. 入力したアカウント情報は安全ですか？
        </Text>
        <Text style={styles.answer}>
          A. 端末内の状態として保持され、外部には送信しません。共有端末では保存を控えてください。
        </Text>
      </View>

      <View style={[styles.section, styles.marginTopLarge]}>
        <Text style={styles.sectionTitle}>問い合わせ先</Text>
        <Text style={[styles.paragraph, styles.marginTopSmall]}>
          改善要望やバグ報告は、開発チームまでご連絡ください。GitHub Issues やチームのチャットツールでの共有をおすすめします。
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
