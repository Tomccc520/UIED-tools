import { RouteRecordRaw } from 'vue-router'
import { AI_RESUME_RELEASE_ENABLED } from '@/config/standaloneTools'
// import webinfo_ip_analysis from '../components/Tools/IPAnalysis/IPAnalysis.vue'
// import webinfo_ip_batch from '../components/Tools/IPBatch/IPBatch.vue'
// import webinfo_ip_gps from '../components/Tools/IPGPS/IPGps.vue'

const standaloneRedirectComponent = { render: () => null }

/**
 * 函数说明：将旧版 Vue 工具地址整页替换为独立子应用地址，避免新旧产品并存。
 */
const redirectToStandaloneTool = (targetUrl: string): false => {
  if (typeof window !== 'undefined') {
    window.location.replace(targetUrl)
  }
  return false
}

/**
 * 函数说明：此处仅保留路由注册和少量行为型 meta，页面 SEO 统一由后台配置与运行时服务处理。
 */
export const constantRoute: RouteRecordRaw[] = [
  //首页
  {
    path: '/',
    component: () => import('../components/Home/Home.vue'),
    name: 'home',
  },
  // 更新日志
  {
    path: '/changelog',
    component: () => import('../components/Home/Changelog.vue'),
    name: 'changelog',
  },
  {
    path: '/user/login',
    component: () => import('../components/User/Login.vue'),
    name: 'userLogin',
    meta: {
      hideToolsRecommend: true
    }
  },
  {
    path: '/user/center',
    component: () => import('../components/User/Center.vue'),
    name: 'userCenter',
    meta: {
      hideToolsRecommend: true
    }
  },
  // 图片处理工具
  {
    path: '/tools/qrcode',
    component: () => import('../components/Tools/Qrcode/Qrcode.vue'),
    name: 'qrcode',
  },
  {
    path: '/tools/favicon-maker',
    component: () => import('../components/Tools/FaviconMaker/FaviconMaker.vue'),
    name: 'faviconmaker',
  },
  {
    path: '/tools/signimage',
    component: () => import('../components/Tools/SignImage/SignImage.vue'),
    name: 'signimage',
  },
  {
    path: '/tools/texttoimg',
    component: () => import('../components/Tools/TextToImg/TextToImg.vue'),
    name: 'textToImg',
  },
  {
    path: '/tools/image-compress',
    component: () => import('../components/Tools/ImageCompress/ImageCompress.vue'),
    name: 'imageCompress',
  },
  {
    path: '/tools/image-crop',
    component: () => import('../components/Tools/ImageCrop/ImageCrop.vue'),
    name: 'imageCrop',
  },
  {
    path: '/tools/ai/remove-watermark',
    component: () => import('../components/Tools/AI/RemoveWatermark.vue'),
    name: 'aiRemoveWatermark',
  },
  {
    path: '/tools/ai/article-generator',
    component: () => import('../components/Tools/AI/Writing/AIArticleGenerator.vue'),
    name: 'aiArticleGenerator',
  },
  {
    path: '/tools/ai/work-summary',
    component: () => import('../components/Tools/AI/Writing/AIWorkSummary.vue'),
    name: 'aiWorkSummary',
  },
  {
    path: '/tools/ai/intern-summary',
    component: () => import('../components/Tools/AI/Writing/InternSummary.vue'),
    name: 'internSummary',
  },
  {
    path: '/tools/ai/practice-report',
    component: () => import('../components/Tools/AI/Writing/PracticeReport.vue'),
    name: 'practiceReport',
  },
  {
    path: '/tools/ai/analysis-report',
    redirect: '/tools/ai/analysis/analysis-report',
    name: 'analysisReportRedirect'
  },
  {
    path: '/tools/ai/weekly-summary',
    component: () => import('../components/Tools/AI/Writing/WeeklySummary.vue'),
    name: 'weeklySummary',
  },
  {
    path: '/tools/ai/book-review',
    component: () => import('../components/Tools/AI/Writing/BookReview.vue'),
    name: 'bookReview',
  },
  {
    path: '/tools/ai/literature-review',
    component: () => import('../components/Tools/AI/Writing/LiteratureReview.vue'),
    name: 'literatureReview',
  },
  {
    path: '/tools/ai/training-experience',
    component: () => import('../components/Tools/AI/Writing/TrainingExperience.vue'),
    name: 'trainingExperience',
  },
  {
    path: '/tools/ai/work-report-ppt',
    component: () => import('../components/Tools/AI/Writing/WorkReportPPT.vue'),
    name: 'workReportPPT',
  },
  {
    path: '/tools/ai/speech-draft',
    component: () => import('../components/Tools/AI/Writing/SpeechDraft.vue'),
    name: 'speechDraft',
  },
  {
    path: '/tools/ai/novel-plot',
    component: () => import('../components/Tools/AI/Writing/NovelPlot.vue'),
    name: 'novelPlot',
  },
  {
    path: '/tools/ai/debriefing-report',
    component: () => import('../components/Tools/AI/Writing/DebriefingReport.vue'),
    name: 'debriefingReport',
  },
  {
    path: '/tools/ai/essay-writing',
    component: () => import('../components/Tools/AI/Writing/EssayWriting.vue'),
    name: 'essayWriting',
  },
  {
    path: '/tools/ai/xiaohongshu-note',
    component: () => import('../components/Tools/AI/Writing/XiaohongshuNote.vue'),
    name: 'xiaohongshuNote',
  },
  {
    path: '/tools/ai/xiaohongshu-title',
    component: () => import('../components/Tools/AI/Writing/XiaohongshuTitle.vue'),
    name: 'xiaohongshuTitle',
  },
  {
    path: '/tools/ai/xiaohongshu-rewrite',
    component: () => import('../components/Tools/AI/Writing/XiaohongshuRewrite.vue'),
    name: 'xiaohongshuRewrite',
  },
  {
    path: '/tools/ai/essay-contest',
    component: () => import('../components/Tools/AI/Writing/EssayContest.vue'),
    name: 'essayContest',
  },
  {
    path: '/tools/ai/spokesperson-speech',
    component: () => import('../components/Tools/AI/Writing/SpokespersonSpeech.vue'),
    name: 'spokespersonSpeech',
  },
  {
    path: '/tools/ai/literature-recommend',
    component: () => import('../components/Tools/AI/Writing/LiteratureRecommend.vue'),
    name: 'aiLiteratureRecommend',
  },
  {
    path: '/tools/ai/self-reflection',
    component: () => import('../components/Tools/AI/Writing/SelfReflection.vue'),
    name: 'aiSelfReflection',
  },
  {
    path: '/tools/ai/project-proposal',
    component: () => import('../components/Tools/AI/Writing/ProjectProposal.vue'),
    name: 'aiProjectProposal',
  },
  {
    path: '/tools/ai/speech-script',
    component: () => import('../components/Tools/AI/Writing/SpeechScript.vue'),
    name: 'aiSpeechScript',
  },
  {
    path: '/tools/ai/short-video-title',
    component: () => import('../components/Tools/AI/Writing/ShortVideoTitle.vue'),
    name: 'aiShortVideoTitle',
  },
  {
    path: '/tools/ai/short-video-script',
    component: () => import('../components/Tools/AI/Writing/ShortVideoScript.vue'),
    name: 'aiShortVideoScript',
  },
  {
    path: '/tools/ai/office/custom-summary',
    component: () => import('../components/Tools/AI/Office/CustomSummary.vue'),
    name: 'aiCustomSummary',
  },
  {
    path: '/tools/ai/office/resume-creation',
    component: () => import('../components/Tools/AI/Office/ResumeCreation.vue'),
    name: 'aiResumeCreation',
  },
  {
    path: '/tools/ai/analysis/research-report',
    component: () => import('../components/Tools/AI/Analysis/ResearchReport.vue'),
    name: 'aiResearchReport',
  },
  {
    path: '/tools/ai/analysis/analysis-report',
    component: () => import('../components/Tools/AI/Analysis/AnalysisReport.vue'),
    name: 'aiAnalysisReportNew',
  },
  {
    path: '/tools/ai/analysis/activity-plan',
    component: () => import('../components/Tools/AI/Analysis/ActivityPlan.vue'),
    name: 'aiActivityPlan',
  },
  {
    path: '/tools/ai/analysis/business-plan',
    component: () => import('../components/Tools/AI/Analysis/BusinessPlan.vue'),
    name: 'aiBusinessPlan',
  },
  {
    path: '/tools/ai/analysis/survey-report',
    component: () => import('../components/Tools/AI/Analysis/SurveyReport.vue'),
    name: 'aiSurveyReport',
  },
  {
    path: '/tools/ai/analysis/industry-report',
    component: () => import('../components/Tools/AI/Analysis/IndustryReport.vue'),
    name: 'aiIndustryReport',
  },
  {
    path: '/tools/ai/analysis/feasibility-study',
    component: () => import('../components/Tools/AI/Analysis/FeasibilityStudy.vue'),
    name: 'aiFeasibilityStudy',
  },
  {
    path: '/tools/ai/analysis/project-application',
    component: () => import('../components/Tools/AI/Analysis/ProjectApplication.vue'),
    name: 'aiProjectApplication',
  },
  {
    path: '/tools/ai/analysis/pest',
    component: () => import('../components/Tools/AI/Analysis/PestAnalysis.vue'),
    name: 'aiPEST',
  },
  {
    path: '/tools/ai/analysis/swot',
    component: () => import('../components/Tools/AI/Analysis/SwotAnalysis.vue'),
    name: 'aiSWOT',
  },
  {
    path: '/tools/ai/analysis/transport-plan',
    component: () => import('../components/Tools/AI/Analysis/TransportPlan.vue'),
    name: 'aiTransportPlan',
  },
  {
    path: '/tools/ai/analysis/situation-report',
    component: () => import('../components/Tools/AI/Analysis/SituationReport.vue'),
    name: 'aiSituationReport',
  },
  {
    path: '/tools/ai/analysis/seven-s',
    component: () => import('../components/Tools/AI/Analysis/BostonAnalysis.vue'),
    name: 'aiSevenS',
  },
  {
    path: '/tools/ai/analysis/marketing-4p',
    component: () => import('../components/Tools/AI/Analysis/Marketing4p.vue'),
    name: 'aiMarketing4P',
  },
  {
    path: '/tools/ai/analysis/industry-consultant',
    component: () => import('../components/Tools/AI/Analysis/IndustryConsultant.vue'),
    name: 'aiIndustryConsultant',
  },
  {
    path: '/tools/ai/analysis/startup-ideas',
    component: () => import('../components/Tools/AI/Analysis/InnovationIdea.vue'),
    name: 'aiStartupIdeas',
  },
  {
    path: '/tools/ai/office/work-plan',
    component: () => import('../components/Tools/AI/Office/WorkPlan.vue'),
    name: 'aiWorkPlan',
  },
  {
    path: '/tools/ai/office/holiday-notice',
    component: () => import('../components/Tools/AI/Office/HolidayNotice.vue'),
    name: 'aiHolidayNotice',
  },
  {
    path: '/tools/ai/office/notice-writing',
    component: () => import('../components/Tools/AI/Office/NoticeWriting.vue'),
    name: 'aiNoticeWriting',
  },
  {
    path: '/tools/ai/office/work-report',
    component: () => import('../components/Tools/AI/Office/WorkReport.vue'),
    name: 'aiWorkReport',
  },
  {
    path: '/tools/ai/office/competitor-speech',
    component: () => import('../components/Tools/AI/Office/CompetitorSpeech.vue'),
    name: 'aiCompetitorSpeech',
  },
  {
    path: '/tools/ai/office/design-concept',
    component: () => import('../components/Tools/AI/Office/DesignConcept.vue'),
    name: 'aiDesignConcept',
  },
  {
    path: '/tools/ai/office/questionnaire-design',
    component: () => import('../components/Tools/AI/Office/QuestionnaireDesign.vue'),
    name: 'aiQuestionnaireDesign',
  },
  {
    path: '/tools/ai/office/tender-writing',
    component: () => import('../components/Tools/AI/Office/TenderWriting.vue'),
    name: 'aiTenderWriting',
  },
  {
    path: '/tools/ai/office/cover-letter',
    component: () => import('../components/Tools/AI/Office/CoverLetter.vue'),
    name: 'aiCoverLetter',
  },
  {
    path: '/tools/ai/office/interview-outline',
    component: () => import('../components/Tools/AI/Office/InterviewOutline.vue'),
    name: 'aiInterviewOutline',
  },
  {
    path: '/tools/ai/article-summary',
    component: () => import('../components/Tools/AI/Writing/ArticleSummary.vue'),
    name: 'aiArticleSummary',
  },
  {
    path: '/tools/ai/opening-report',
    component: () => import('../components/Tools/AI/Writing/OpeningReport.vue'),
    name: 'aiOpeningReport',
  },
  {
    path: '/tools/ai/article-outline',
    component: () => import('../components/Tools/AI/Writing/ArticleOutline.vue'),
    name: 'aiArticleOutline',
  },
  {
    path: '/tools/ai/article-polishing',
    component: () => import('../components/Tools/AI/Writing/ArticlePolishing.vue'),
    name: 'aiArticlePolishing',
  },
  {
    path: '/tools/ai/graduation-thesis',
    component: () => import('../components/Tools/AI/Writing/GraduationThesis.vue'),
    name: 'aiGraduationThesis',
  },
  // AI学生助手
  {
    path: '/tools/ai/student/internship-comments',
    component: () => import('../components/Tools/AI/Student/InternshipComments.vue'),
    name: 'aiInternshipComments',
  },
  {
    path: '/tools/ai/student/research-report',
    component: () => import('../components/Tools/AI/Student/ResearchReport.vue'),
    name: 'aiStudentResearchReport',
  },
  {
    path: '/tools/ai/student/internship-weekly',
    component: () => import('../components/Tools/AI/Student/InternshipWeekly.vue'),
    name: 'aiInternshipWeekly',
  },
  {
    path: '/tools/ai/student/internship-summary',
    component: () => import('../components/Tools/AI/Student/InternshipSummary.vue'),
    name: 'aiStudentInternshipSummary',
  },
  {
    path: '/tools/ai/student/social-practice',
    component: () => import('../components/Tools/AI/Student/SocialPractice.vue'),
    name: 'aiSocialPractice',
  },
  {
    path: '/tools/ai/student/practice-report',
    component: () => import('../components/Tools/AI/Student/PracticeReport.vue'),
    name: 'aiStudentPracticeReport',
  },
  {
    path: '/tools/ai/student/analysis-report',
    component: () => import('../components/Tools/AI/Student/AnalysisReport.vue'),
    name: 'aiStudentAnalysisReport',
  },
  {
    path: '/tools/ai/student/interview-guide',
    component: () => import('../components/Tools/AI/Student/InterviewGuide.vue'),
    name: 'aiInterviewGuide',
  },
  {
    path: '/tools/ai/student/internship-experience',
    component: () => import('../components/Tools/AI/Student/InternshipExperience.vue'),
    name: 'aiInternshipExperience',
  },
  {
    path: '/tools/ai/student/internship-report',
    component: () => import('../components/Tools/AI/Student/InternshipReport.vue'),
    name: 'aiStudentInternshipReport',
  },
  {
    path: '/tools/ai/student/resume-creation',
    component: () => import('../components/Tools/AI/Student/ResumeCreation.vue'),
    name: 'aiStudentResumeCreation',
  },
  {
    path: '/tools/ai/student/activity-plan',
    component: () => import('../components/Tools/AI/Student/ActivityPlan.vue'),
    name: 'aiStudentActivityPlan',
  },
  {
    path: '/tools/image-to-webp',
    component: () => import('../components/Tools/ImageToWebp/ImageToWebp.vue'),
    name: 'imageToWebp',
  },
  {
    path: '/tools/gif-compress',
    component: () => import('../components/Tools/GifCompress/GifCompress.vue'),
    name: 'gifCompress',
  },
  {
    path: '/tools/img-cut',
    component: () => import('../components/Tools/ImgCut/ImgCut.vue'),
    name: 'imgCut',
  },
  {
    path: '/tools/image-joiner',
    component: () => import('../components/Tools/ImageJoiner/ImageJoiner.vue'),
    name: 'imageJoiner',
  },
  {
    path: '/tools/image-to-gif',
    component: () => import('../components/Tools/ImageToGif/ImageToGif.vue'),
    name: 'imageToGif',
  },
  {
    path: '/tools/img-watermark',
    component: () => import('../components/Tools/ImgWatermark/ImgWatermark.vue'),
    name: 'imgWatermark',
  },
  {
    path: '/tools/img-format',
    component: () => import('../components/Tools/ImgFormat/ImgFormat.vue'),
    name: 'imgFormat',
  },
  {
    path: '/tools/img-to-pdf',
    component: () => import('../components/Tools/ImageToPdf/ImageToPdf.vue'),
    name: 'imageToPdf',
  },
  {
    path: '/tools/pdf-to-images',
    component: () => import('../components/Tools/PdfToImages/index.vue'),
    name: 'pdfToImages',
  },
  {
    path: '/tools/pdf-merge',
    component: () => import('../components/Tools/PdfMerge/index.vue'),
    name: 'pdfMerge',
  },
  {
    path: '/tools/pdf-split',
    component: () => import('../components/Tools/PdfSplit/index.vue'),
    name: 'pdfSplit',
  },
  {
    path: '/tools/pdf-rotate',
    component: () => import('../components/Tools/PdfRotate/index.vue'),
    name: 'pdfRotate',
  },
  {
    path: '/tools/pdf-delete',
    component: () => import('../components/Tools/PdfDelete/index.vue'),
    name: 'pdfDelete',
  },
  {
    path: '/tools/pdf-compress',
    component: () => import('../components/Tools/PdfCompress/index.vue'),
    name: 'pdfCompress',
  },
  {
    path: '/tools/pdf-watermark',
    component: () => import('../components/Tools/PdfWatermark/index.vue'),
    name: 'pdfWatermark',
  },
  {
    path: '/tools/pdf-encrypt',
    component: () => import('../components/Tools/PdfEncrypt/index.vue'),
    name: 'pdfEncrypt',
  },
  {
    path: '/tools/pdf-page-number',
    component: () => import('../components/Tools/PdfPageNumber/index.vue'),
    name: 'pdfPageNumber',
  },
  {
    path: '/tools/pdf-sign',
    component: () => import('../components/Tools/PdfSign/index.vue'),
    name: 'pdfSign',
  },
  {
    path: '/tools/pdf-extract-text',
    component: () => import('../components/Tools/PdfExtractText/index.vue'),
    name: 'pdfExtractText',
  },
  {
    path: '/tools/text-to-pdf',
    component: () => import('../components/Tools/TextToPdf/index.vue'),
    name: 'textToPdf',
  },
  {
    path: '/tools/markdown-to-pdf',
    component: () => import('../components/Tools/MarkdownToPdf/index.vue'),
    name: 'markdownToPdf',
  },
  {
    path: '/tools/word-count',
    component: () => import('../components/Tools/WordCount/index.vue'),
    name: 'wordCount',
  },
  {
    path: '/tools/doc/markdown-table',
    component: () => import('../components/Tools/Doc/MarkdownTable/MarkdownTable.vue'),
    name: 'markdownTable',
  },
  {
    path: '/tools/doc/text-cleaner',
    component: () => import('../components/Tools/Doc/TextCleaner/TextCleaner.vue'),
    name: 'textCleaner',
  },
  {
    path: '/tools/doc/number-chinese',
    component: () => import('../components/Tools/Doc/NumberToChinese/NumberToChinese.vue'),
    name: 'numberToChinese',
  },
  {
    path: '/tools/dev/keycode',
    component: () => import('../components/Tools/Dev/KeyCode/KeyCode.vue'),
    name: 'keyCode',
  },
  {
    path: '/tools/dev/user-agent',
    component: () => import('../components/Tools/Dev/UserAgent/UserAgent.vue'),
    name: 'userAgent',
  },
  {
    path: '/tools/video',
    component: () => import('../components/Tools/Video/VideoHub/VideoHub.vue'),
    name: 'videoHub',
  },
  {
    path: '/tools/video/frame',
    component: () => import('../components/Tools/Video/VideoFrame/VideoFrame.vue'),
    name: 'videoFrame',
  },
  {
    path: '/tools/video/compress',
    component: () => import('../components/Tools/Video/VideoCompress/VideoCompress.vue'),
    name: 'videoCompress',
  },
  {
    path: '/tools/video/convert',
    component: () => import('../components/Tools/Video/VideoFormatConvert/VideoFormatConvert.vue'),
    name: 'videoFormatConvert',
  },
  {
    path: '/tools/video/resolution',
    component: () => import('../components/Tools/Video/VideoResolutionReset/VideoResolutionReset.vue'),
    name: 'videoResolutionReset',
  },
  {
    path: '/tools/video/merge',
    component: () => import('../components/Tools/Video/VideoMerge/VideoMerge.vue'),
    name: 'videoMerge',
  },
  {
    path: '/tools/video/audio',
    redirect: '/tools/video/to-audio',
    name: 'videoToAudioLegacy',
  },
  {
    path: '/tools/life/countdown',
    component: () => import('../components/Tools/Life/CountdownDay.vue'),
    name: 'countdownDay',
  },
  {
    path: '/tools/video/mute',
    component: () => import('../components/Tools/Video/VideoMute/VideoMute.vue'),
    name: 'videoMute',
  },
  {
    path: '/tools/video/gif',
    component: () => import('../components/Tools/Video/VideoToGif/VideoToGif.vue'),
    name: 'videoToGif',
  },
  {
    path: '/tools/video/webcam',
    component: () => import('../components/Tools/Video/WebcamRecorder/WebcamRecorder.vue'),
    name: 'webcamRecorder',
  },
  {
    path: '/tools/video/watermark',
    component: () => import('../components/Tools/Video/VideoWatermark/VideoWatermark.vue'),
    name: 'videoWatermark',
  },
  {
    path: '/tools/video/speed',
    component: () => import('../components/Tools/Video/VideoSpeed/VideoSpeed.vue'),
    name: 'videoSpeed',
  },
  {
    path: '/tools/audio/trimmer',
    component: () => import('../components/Tools/Audio/AudioTrimmer/AudioTrimmer.vue'),
    name: 'audioTrimmer',
  },
  {
    path: '/tools/audio/merge',
    component: () => import('../components/Tools/Audio/AudioMerge/AudioMerge.vue'),
    name: 'audioMerge',
  },
  {
    path: '/tools/dev/url-parser',
    component: () => import('../components/Tools/Dev/UrlParser/UrlParser.vue'),
    name: 'urlParser',
  },
  {
    path: '/tools/doc/spec',
    component: () => import('../components/Tools/Doc/DocSpec/DocSpec.vue'),
    name: 'docSpec',
  },
  {
    path: '/tools/dev/json-format',
    component: () => import('../components/Tools/Dev/JsonFormat/JsonFormat.vue'),
    name: 'jsonFormat',
  },
  {
    path: '/tools/dev/diff-checker',
    component: () => import('../components/Tools/Dev/DiffChecker/DiffChecker.vue'),
    name: 'diffChecker',
  },
  {
    path: '/tools/media/qrcode-generator',
    redirect: '/tools/qrcode',
    name: 'qrcodeGeneratorRedirect'
  },
  {
    path: '/tools/dev/url-encoder',
    component: () => import('../components/Tools/Dev/UrlEncoder/UrlEncoder.vue'),
    name: 'urlEncoder',
  },
  {
    path: '/tools/dev/timestamp-converter',
    component: () => import('../components/Tools/Dev/TimestampConverter/TimestampConverter.vue'),
    name: 'timestampConverter',
  },
  {
    path: '/tools/dev/md5-encrypt',
    component: () => import('../components/Tools/Dev/Md5Encrypt/Md5Encrypt.vue'),
    name: 'md5Encrypt',
  },
  {
    path: '/tools/date-calculator',
    component: () => import('../components/Tools/DateCalculator/index.vue'),
    name: 'dateCalculator',
  },
  {
    path: '/tools/screen-recorder',
    component: () => import('../components/Tools/ScreenRecorder/index.vue'),
    name: 'screenRecorder',
  },
  {
    path: '/tools/relationship',
    component: () => import('../components/Tools/Relationship/Relationship.vue'),
    name: 'relationship',
  },
  {
    path: '/tools/base64',
    component: () => import('../components/Tools/Base64/Base64.vue'),
    name: 'base64',
  },
  // 表格工具
  {
    path: '/tools/excel-to-json',
    component: () => import('../components/Tools/ExcelToJson/index.vue'),
    name: 'excelToJson',
  },
  {
    path: '/tools/json-to-excel',
    component: () => import('../components/Tools/JsonToExcel/index.vue'),
    name: 'jsonToExcel',
  },
  {
    path: '/tools/csv-to-excel',
    component: () => import('../components/Tools/CsvToExcel/index.vue'),
    name: 'csvToExcel',
  },
  {
    path: '/tools/excel-to-csv',
    component: () => import('../components/Tools/ExcelToCsv/index.vue'),
    name: 'excelToCsv',
  },
  {
    path: '/tools/ai/office/work-reflections',
    component: () => import('../components/Tools/AI/Office/WorkReflections.vue'),
    name: 'aiWorkReflections',
  },
  {
    path: '/tools/ai/office/application-report',
    component: () => import('../components/Tools/AI/Office/ApplicationReport.vue'),
    name: 'aiApplicationReport',
  },
  {
    path: '/tools/ai/office/resignation-letter',
    component: () => import('../components/Tools/AI/Office/ResignationLetter.vue'),
    name: 'aiResignationLetter',
  },
  {
    path: '/tools/ai/office/training-scheme',
    component: () => import('../components/Tools/AI/Office/TrainingScheme.vue'),
    name: 'aiTrainingScheme',
  },
  {
    path: '/tools/ai/office/contract-template',
    component: () => import('../components/Tools/AI/Office/ContractTemplate.vue'),
    name: 'aiContractTemplate',
  },
  {
    path: '/tools/ai/office/meeting-minutes',
    component: () => import('../components/Tools/AI/Office/MeetingMinutes.vue'),
    name: 'aiMeetingMinutes',
  },
  {
    path: '/tools/ai/office/okr-generator',
    component: () => import('../components/Tools/AI/Office/OKRGenerator.vue'),
    name: 'aiOKRGenerator',
  },
  {
    path: '/tools/ai/office/code-generator',
    component: () => import('../components/Tools/AI/Office/CodeGenerator.vue'),
    name: 'aiCodeGenerator',
  },
  {
    path: '/tools/ai/office/job-description',
    component: () => import('../components/Tools/AI/Office/JobDescription.vue'),
    name: 'aiJobDescription',
  },
  {
    path: '/tools/ai/office/lawsuit-document',
    component: () => import('../components/Tools/AI/Office/LawsuitDocument.vue'),
    name: 'aiLawsuitDocument',
  },
  //工具
  {
    path: '/tools/timetran',
    component: () => import('../components/Tools/TimeTran/TimeTran.vue'),
    name: 'timetran',
  },
  {
    path: '/tools/md5',
    component: () => import('../components/Tools/MD5/MD5.vue'),
    name: 'md5',
  },
  {
    path: '/tools/json',
    component: () => import('../components/Tools/JsonTran/JsonTran.vue'),
    name: 'json',
  },
  {
    path: '/tools/reg',
    component: () => import('../components/Tools/RegTest/RegTest.vue'),
    name: 'reg',
  },
  {
    path: '/tools/unicode',
    component: () => import('../components/Tools/Unicode/Unicode.vue'),
    name: 'unicode',
  },
  {
    path: '/tools/wordcount',
    component: () => import('../components/Tools/WordCount/WordCount.vue'),
    name: 'wordcount',
  },

  {
    path: '/tools/scaletran',
    component: () => import('../components/Tools/ScaleTran/ScaleTran.vue'),
    name: 'scaletran',
  },
  {
    path: '/tools/randompassword',
    component: () => import('../components/Tools/RandomPassword/RandomPassword.vue'),
    name: 'randompassword',
  },
  {
    path: '/tools/urlencode',
    component: () => import('../components/Tools/UrlEncode/UrlEncode.vue'),
    name: 'urlencode',
  },
  {
    path: '/tools/ascii',
    component: () => import('../components/Tools/ASCII/ASCII.vue'),
    name: 'ascii',
  },
  {
    path: '/tools/uuid',
    component: () => import('../components/Tools/UUID/UUID.vue'),
    name: 'uuid',
  },
  {
    path: '/tools/barrage',
    component: () => import('../components/Tools/Barrage/Barrage.vue'),
    name: 'barrage',
  },
  {
    path: '/tools/palettes',
    component: () => import('../components/Tools/Palettes/Palettes.vue'),
    name: 'palettes',
  },
  {
    path: '/tools/unit',
    component: () => import('../components/Tools/Unit/Unit.vue'),
    name: 'unit',
  },
  {
    path: '/tools/decision',
    component: () => import('../components/Tools/Decision/Decision.vue'),
    name: 'decision',
  },
  {
    path: '/tools/random',
    component: () => import('../components/Tools/Random/Random.vue'),
    name: 'random',
  },
  {
    path: '/tools/coin',
    component: () => import('../components/Tools/Coin/Coin.vue'),
    name: 'coin',
  },
  {
    path: '/tools/dice',
    component: () => import('../components/Tools/Dice/Dice.vue'),
    name: 'dice',
  },
  {
    path: '/tools/avatar/random',
    component: () => import('../components/Tools/Avatar/RandomAvatar.vue'),
    name: 'randomAvatar',
  },
  {
    path: '/tools/textremoveduplicate',
    component: () => import('../components/Tools/TextRemoveDuplicate/TextRemoveDuplicate.vue'),
    name: 'textremoveduplicate',
  },
  {
    path: '/tools/httpstatuscode',
    component: () => import('../components/Tools/HttpStatusCode/HttpStatusCode.vue'),
    name: 'httpstatuscode',
  },
  {
    path: '/tools/jwt',
    component: () => import('../components/Tools/JWT/JWT.vue'),
    name: 'jwt',
  },
  {
    path: '/tools/htmlentity',
    component: () => import('../components/Tools/HtmlEntity/HtmlEntity.vue'),
    name: 'htmlentity',
  },
  {
    path: '/tools/colorpicker',
    component: () => import('../components/Tools/ColorPicker/ColorPicker.vue'),
    name: 'colorpicker',
  },
  {
    path: '/tools/asciiwordpic',
    component: () => import('../components/Tools/ASCIIWordPic/ASCIIWordPic.vue'),
    name: 'asciiwordpic',
  },
  {
    path: '/tools/htmlformat',
    component: () => import('../components/Tools/HtmlFormat/HtmlFormat.vue'),
    name: 'htmlformat',
  },
  {
    path: '/tools/cssformat',
    component: () => import('../components/Tools/CssFormat/CssFormat.vue'),
    name: 'cssformat',
  },
  {
    path: '/tools/textedit',
    component: () => import('../components/Tools/TextEdit/TextEdit.vue'),
    name: 'textedit',
  },
  {
    path: '/tools/bar',
    component: () => import('../components/Tools/Chart/Bar/Bar.vue'),
    name: 'bar',
  },
  {
    path: '/tools/line',
    component: () => import('../components/Tools/Chart/Line/Line.vue'),
    name: 'line',
  },
  {
    path: '/tools/pie',
    component: () => import('../components/Tools/Chart/Pie/Pie.vue'),
    name: 'pie',
  },
  {
    path: '/tools/scatter',
    component: () => import('../components/Tools/Chart/Scatter/Scatter.vue'),
    name: 'scatter',
  },
  {
    path: '/tools/diff',
    component: () => import('../components/Tools/Diff/Diff.vue'),
    name: 'diff',
  },
  {
    path: '/tools/markdown',
    component: () => import('../components/Tools/Markdown/Markdown.vue'),
    name: 'markdown',
  },
  // 潜能测试路由
  {
    path: '/tools/psychology/mbti',
    component: () => import('../components/Tools/Psychology/MBTI.vue'),
    name: 'mbti',
  },
  {
    path: '/tools/psychology/enneagram',
    component: () => import('../components/Tools/Psychology/Enneagram.vue'),
    name: 'enneagram',
  },
  {
    path: '/tools/psychology/big-five',
    component: () => import('../components/Tools/Psychology/BigFive.vue'),
    name: 'bigfive',
  },
  {
    path: '/tools/psychology/abo',
    component: () => import('../components/Tools/Psychology/ABO.vue'),
    name: 'abo',
  },
  {
    path: '/tools/psychology/programmer-test',
    component: () => import('../components/Tools/Psychology/ProgrammerTest.vue'),
    name: 'programmerTest',
  },
  {
    path: '/tools/psychology/left-right-brain',
    component: () => import('../components/Tools/Psychology/LeftRightBrain.vue'),
    name: 'leftRightBrain',
  },
  {
    path: '/tools/psychology/eq-test',
    component: () => import('../components/Tools/Psychology/EQTest.vue'),
    name: 'eqTest',
  },
  {
    path: '/tools/morse',
    component: () => import('../components/Tools/Morse/Morse.vue'),
    name: 'morse',
  },
  // 文案工具
  {
    path: '/tools/copywriting/design-quotes',
    component: () => import('../components/Tools/Copywriting/DesignQuotes.vue'),
    name: 'designQuotes',
  },
  {
    path: '/tools/copywriting/love-apartment',
    component: () => import('../components/Tools/Copywriting/LoveApartment.vue'),
    name: 'loveApartment',
  },
  {
    path: '/tools/copywriting/kfc',
    component: () => import('../components/Tools/Copywriting/kfc.vue'),
    name: 'copywritingKFC',
  },
  {
    path: '/tools/copywriting/funny',
    component: () => import('../components/Tools/Copywriting/Funny.vue'),
    name: 'copywritingFunny',
  },
  {
    path: '/tools/copywriting/dog-diary',
    component: () => import('../components/Tools/Copywriting/DogDiary.vue'),
    name: 'dogDiary',
  },
  {
    path: '/tools/copywriting/emotional-quotes',
    component: () => import('../components/Tools/Copywriting/EmotionalQuotes.vue'),
    name: 'emotionalQuotes',
  },
  {
    path: '/tools/copywriting/daily-poem',
    component: () => import('../components/Tools/Copywriting/DailyPoem.vue'),
    name: 'dailyPoem',
  },
  {
    path: '/tools/copywriting/moments',
    component: () => import('../components/Tools/Copywriting/MomentsQuotes.vue'),
    name: 'momentsQuotes',
  },
  {
    path: '/tools/copywriting/inspiring',
    component: () => import('../components/Tools/Copywriting/InspiringQuotes.vue'),
    name: 'inspiringQuotes',
  },
  {
    path: '/tools/copywriting/cloud-music',
    component: () => import('../components/Tools/Copywriting/CloudMusicComments.vue'),
  },
  {
    path: '/tools/copywriting/comfort',
    component: () => import('../components/Tools/Copywriting/ComfortQuotes.vue'),
    name: 'comfortQuotes',
  },
  {
    path: '/tools/copywriting/poison-soup',
    component: () => import('../components/Tools/Copywriting/PoisonSoup.vue'),
    name: 'poisonSoup',
  },
  {
    path: '/tools/copywriting/newyear',
    component: () => import('../components/Tools/Copywriting/NewYear.vue'),
  },
  {
    path: '/tools/ai/prompt-reverse',
    component: () => import('../components/Tools/AI/PromptReverse.vue'),
    name: 'promptReverse',
  },
  {
    path: '/tools/ai/text-to-speech',
    component: () => import('../components/Tools/AI/TextToSpeech.vue'),
    name: 'textToSpeech',
  },
  // 关于
  {
    path: '/about',
    component: () => import('../components/Home/About.vue'),
    name: 'about',
    meta: {
      title: '关于我们',
      keywords: 'UIED Tools,UIED-Tools,在线工具平台,免费在线工具,AI工具,图片处理工具,办公效率工具',
      description: '了解 UIED Tools 在线工具平台、产品能力、服务方向与开发团队。平台提供 AI、设计、图片处理、办公和开发等实用在线工具。',
      image: '/favicon.ico',
    }
  },
  //其他路由
  {
    path: '/404',
    component: () => import('../components/404/404.vue'),
    name: '404',
    meta: {
      title: "404"
    }
  },
  {
    path: '/tools/random-tools',
    component: () => import('../components/Tools/RandomTools/RandomTools.vue'),
    name: 'randomTools',
    meta: {
      hideToolsRecommend: true
    }
  },
  // 头像工具路由
  {
    path: '/tools/avatar/anime',
    component: () => import('../components/Tools/Avatar/AnimeAvatar.vue'),
    name: 'animeAvatar',
  },
  {
    path: '/tools/avatar/rua',
    component: () => import('../components/Tools/Avatar/RuaAvatar.vue'),
    name: 'ruaAvatar',
  },
  {
    path: '/tools/avatar/national-day',
    component: () => import('../components/Tools/Avatar/NationalDayAvatar.vue'),
    name: 'nationalDayAvatar',
  },
  // 设计工具路由
  {
    path: '/tools/design/DesignQuote',
    component: () => import('../components/Tools/Design/DesignQuote.vue'),
    name: 'designQuote',
  },
  {
    path: '/tools/design/color',
    component: () => import('../components/Tools/Design/Color.vue'),
    name: 'colorPalette',
  },
  {
    path: '/tools/design/font',
    component: () => import('../components/Tools/Design/Font.vue'),
    name: 'fontMatch',
  },
  {
    path: '/tools/design/font-copyright',
    component: () => import('../components/Tools/Design/FontCopyright.vue'),
    name: 'fontCopyright',
  },
  {
    path: '/tools/design/ui-spec',
    component: () => import('../components/Tools/Design/UiSpec.vue'),
    name: 'uiSpec',
  },
  {
    path: '/tools/design/logo-spec',
    component: () => import('../components/Tools/Design/LogoSpec.vue'),
    name: 'logoSpec',
  },
  {
    path: '/tools/design/brand-spec',
    component: () => import('../components/Tools/Design/BrandSpec.vue'),
    name: 'brandSpec',
  },
  /* 未开发功能-设计合同生成器
  {
    path: '/tools/design/contract',
    component: () => import('../components/Tools/Design/DesignContract/index.vue'),
    name: 'designContract',
  },
  */
  {
    path: '/tools/design/spec',
    name: 'DesignSpec',
    component: () => import('../components/Tools/Design/DesignSpec.vue'),
  },
  {
    path: '/tools/design/grid',
    name: 'grid',
    component: () => import('../components/Tools/Design/Grid.vue'),
  },
  {
    path: '/tools/design/icon',
    component: () => import('../components/Tools/Design/DesignIcon.vue'),
    name: 'designIcon',
  },
  {
    path: '/tools/design/image-compressor',
    component: () => import('../components/Tools/Design/ImageCompressor/ImageCompressor.vue'),
    name: 'imageCompressor',
  },
  {
    path: '/tools/design/image-svg',
    component: () => import('../components/Tools/Design/DesignImageSvg.vue'),
    name: 'designImageSvg',
  },
  {
    path: '/tools/design/icon-generator',
    name: 'IconGenerator',
    component: () => import('../components/Tools/Design/IconGenerator.vue'),
  },
  {
    path: '/tools/design/contrast-checker',
    name: 'contrastChecker',
    component: () => import('../components/Tools/Design/ContrastChecker/ContrastChecker.vue'),
  },
  {
    path: '/tools/design/box-shadow',
    name: 'boxShadow',
    component: () => import('../components/Tools/Design/BoxShadow/BoxShadow.vue'),
  },
  {
    path: '/tools/design/golden-ratio',
    name: 'goldenRatio',
    component: () => import('../components/Tools/Design/GoldenRatio/GoldenRatio.vue'),
  },
  {
    path: '/tools/design/blob-maker',
    name: 'blobMaker',
    component: () => import('../components/Tools/Design/BlobMaker/BlobMaker.vue'),
  },
  {
      path: '/tools/design/clip-path',
      name: 'clipPathMaker',
      component: () => import('../components/Tools/Design/ClipPathMaker/ClipPathMaker.vue'),
    },
    {
      path: '/tools/design/border-radius',
      name: 'borderRadius',
      component: () => import('../components/Tools/Design/BorderRadius/BorderRadius.vue'),
    },
    {
      path: '/tools/design/css-filter',
      name: 'cssFilter',
      component: () => import('../components/Tools/Design/CssFilter/CssFilter.vue'),
    },
    {
      path: '/tools/design/css-triangle',
      name: 'cssTriangle',
      component: () => import('../components/Tools/Design/CssTriangle/CssTriangle.vue'),
    },
    {
      path: '/tools/design/css-ribbon',
      name: 'cssRibbon',
      component: () => import('../components/Tools/Design/CssRibbon/CssRibbon.vue'),
    },
    {
      path: '/tools/design/css-loader',
      name: 'cssLoader',
      component: () => import('../components/Tools/Design/CssLoader/CssLoader.vue'),
    },
    {
      path: '/tools/design/css-flexbox',
      name: 'cssFlexbox',
      component: () => import('../components/Tools/Design/CssFlexbox/CssFlexbox.vue'),
    },
    {
      path: '/tools/design/css-text-shadow',
      name: 'cssTextShadow',
      component: () => import('../components/Tools/Design/CssTextShadow/CssTextShadow.vue'),
    },
    {
      path: '/tools/design/css-gradient-text',
      name: 'cssGradientText',
      component: () => import('../components/Tools/Design/CssGradientText/CssGradientText.vue'),
    },
  {
    path: '/tools/wallpaper/anime',
    component: () => import('../components/Tools/Wallpaper/AnimeWallpaper.vue'),
    name: 'animeWallpaper',
  },
  {
    path: '/tools/emoji/cheshire',
    component: () => import('../components/Tools/Emoji/CheshireEmoji.vue'),
    name: 'cheshireEmoji',
  },
  {
    path: '/tools/emoji/random',
    component: () => import('../components/Tools/Emoji/RandomEmoji.vue'),
    name: 'randomEmoji',
  },
  {
    path: '/tools/emoji-maker',
    component: () => import('../components/Tools/Emoji/EmojiMaker.vue'),
    name: 'emojiMaker',
  },
  {
    path: '/tools/hot-ranking',
    name: 'HotRanking',
    component: () => import('../components/Tools/HotRanking/HotRanking.vue'),
    meta: {
      hideToolsRecommend: true  // 禁用工具推荐
    }
  },
  {
    path: '/tools/horoscope',
    component: () => import('../components/Tools/Horoscope/Horoscope.vue'),
    name: 'horoscope',
  },
  {
    path: '/tools/photo/background',
    component: () => import('../components/Tools/Photo/PhotoBackground.vue'),
    name: 'photoBackground',
  },
  {
    path: '/tools/photo/transparent',
    component: () => import('../components/Tools/Photo/PhotoTransparent.vue'),
    name: 'photoTransparent',
  },
  {
    path: '/tools/photo/crop',
    component: () => import('../components/Tools/Photo/PhotoCrop.vue'),
    name: 'photoCrop',
  },
  {
    path: '/tools/photo/layout',
    component: () => import('../components/Tools/Photo/PhotoLayout.vue'),
    name: 'photoLayout',
  },
  {
    path: '/tools/ai/toolbox',
    component: () => import('../components/Tools/AI/AIToolboxHub.vue'),
    name: 'aiToolboxHub',
    meta: {
      hideToolsRecommend: true,
    }
  },
  {
    path: '/tools/ai/deepseek',
    component: () => import('../components/Tools/AI/DeepSeek.vue'),
    name: 'deepseek',
  },
  {
    path: '/tools/ai/image-enhance',
    name: 'ImageEnhance',
    component: () => import('../components/Tools/AI/ImageEnhance.vue'),
  },
  {
    path: '/tools/ai/stable-diffusion',
    component: () => import('../components/Tools/AI/StableDiffusion.vue'),
    name: 'stableDiffusion',
  },
  {
    path: '/tools/ai/qrcode',
    component: () => import('../components/Tools/AI/AIQRCode.vue'),
    name: 'aiQrcode',
  },
  {
    path: '/tools/ai/ocr',
    component: () => import('../components/Tools/AI/OCRRecognition.vue'),
    name: 'ocrRecognition',
  },
  {
    path: '/tools/ai/matting-hub',
    component: () => import('../components/Tools/AI/AIMattingHub.vue'),
    name: 'aiMattingHub',
  },
  {
    path: '/tools/ai/portrait-matting',
    component: () => import('../components/Tools/AI/AIPortraitMatting.vue'),
    name: 'aiPortraitMatting',
  },
  {
    path: '/tools/ai/deepseek-r1',
    component: () => import('../components/Tools/AI/DeepSeekR1.vue'),
    name: 'deepseekR1',
  },
  {
    path: '/tools/ai/xunfei-spark',
    name: 'xunfeiSpark',
    component: () => import('../components/Tools/AI/XunfeiSpark.vue'),
  },
  {
    path: '/tools/ai/icon-generator',
    component: () => import('../components/Tools/AI/AIIconGenerator.vue'),
    name: 'aiIconGenerator',
  },
  {
    path: '/tools/xiaohongshu',
    component: () => import('../components/Tools/AI/XiaoHongShu.vue'),
    name: 'xiaohongshu',
  },
  {
    path: '/tools/ai/chat',
    component: () => import('../components/Tools/AI/AIChat.vue'),
    name: 'aiChat',
  },
  {
    path: '/tools/ai/prompt-editor',
    component: () => import('../components/Tools/AI/AIPromptEditor.vue'),
    name: 'aiPromptEditor',
  },
  {
    path: '/tools/ai-design-cover',
    component: () => import('../components/Tools/AI/AIDesignCover.vue'),
    name: 'aiDesignCover',
  },
  {
    path: '/tools/ai-outsource-quote',
    component: () => import('../components/Tools/AI/AIOutsourceQuote.vue'),
    name: 'aiOutsourceQuote',
  },
  {
    path: '/tools/ai-ranking',
    component: { render: () => null },
    name: 'airanking',
    /**
     * AI产品榜已下线，保留原路由并跳转到外部导航站
     */
    beforeEnter: () => {
      if (typeof window !== 'undefined') {
        window.location.href = 'https://hao.uied.cn/'
      }
      return false
    },
  },
  {
    path: '/tools/ai/deepseek-prompt',
    component: () => import('../components/Tools/AI/DeepSeekPrompt.vue'),
    name: 'deepseekPrompt',
  },
  {
    path: '/tools/ai/deepseek-nav',
    component: () => import('../components/Tools/AI/DeepSeekNav.vue'),
    name: 'deepseekNav',
  },
  {
    path: '/galaxy-motion',
    component: () => import('../components/Tools/GalaxyMotion/GalaxyMotion.vue'),
    name: 'galaxyMotion',
    meta: {
      title: "星系运动查看",
      keywords: '星系运动查看,宇宙模拟,星系运动模拟,摸鱼工具',
      description: '一个可视化的星系运动查看工具，模拟宇宙中星系运动的轨迹和状态，提供沉浸式的宇宙体验。',
    }
  },
  {
    path: '/tools/ai-news',
    name: 'AINews',
    component: () => import('../components/Tools/AI/AINews.vue'),
  },
  /* 暂时隐藏后端API测试工具路由
  {
    path: '/backend-test',
    name: 'backend-test',
    component: BackendTest,
    meta: {
      title: '后端API测试工具 - Tools Web',
      keywords: '后端API测试, API测试, 接口测试, RESTful API测试',
      description: '用于测试后端API接口的工具，支持GET、POST、PUT、DELETE等请求方式的测试。',
      footer: true,
      auth: false
    }
  }
  */
  // UI设计规范工具
  {
    path: '/tools/mobile-ui-spec',
    component: () => import('../components/Tools/Design/MobileUISpec.vue'),
    name: 'mobileUISpec',
  },
  {
    path: '/tools/fish-calendar',
    component: () => import('../components/Tools/FishCalendar/FishCalendar.vue'),
    name: 'fishCalendar',
  },
  {
    path: '/tools/games/typing-rain-cn',
    component: () => import('../components/Tools/Games/TypingRain/TypingRain.vue'),
    name: 'typingRainCn',
  },
  {
    path: '/tools/games/typing-rain-en',
    component: () => import('../components/Tools/Games/TypingRain/TypingRain.vue'),
    name: 'typingRainEn',
  },
  {
    path: '/tools/games/snake',
    component: () => import('../components/Tools/Games/Snake/Snake.vue'),
    name: 'snake',
  },
  {
    path: '/tools/games/minesweeper',
    component: () => import('../components/Tools/Games/Minesweeper/Minesweeper.vue'),
    name: 'minesweeper',
  },
  {
    path: '/tools/games/woodfish',
    component: () => import('../components/Tools/Games/Woodfish/Woodfish.vue'),
    name: 'woodfish',
  },
  {
    path: '/tools/games/2048',
    component: () => import('../components/Tools/Games/Game2048/Game2048.vue'),
    name: 'game2048',
  },
  {
    path: '/tools/games/memory-card',
    component: () => import('../components/Tools/Games/MemoryCard/MemoryCard.vue'),
    name: 'memoryCard',
  },
  {
    path: '/tools/games/reaction-test',
    component: () => import('../components/Tools/Games/ReactionTest/ReactionTest.vue'),
    name: 'reactionTest',
  },
  {
    path: '/tools/daily/decision-maker',
    component: () => import('../components/Tools/Daily/DecisionMaker/DecisionMaker.vue'),
    name: 'decisionMaker',
  },
  {
    path: '/tools/psychology/color-test',
    component: () => import('../components/Tools/Psychology/ColorTest.vue'),
    name: 'colorTest',
  },
  {
    path: '/tools/games/gomoku',
    component: () => import('../components/Tools/Games/Gomoku/Gomoku.vue'),
    name: 'gomoku',
  },
  {
    path: '/tools/daily/breathing',
    component: () => import('../components/Tools/Daily/Breathing/Breathing.vue'),
    name: 'breathing',
  },
  {
    path: '/tools/daily/screen-test',
    component: () => import('../components/Tools/Daily/ScreenTest/ScreenTest.vue'),
    name: 'screenTest',
  },
  {
    path: '/tools/dev/cron',
    component: () => import('../components/Tools/Dev/Cron/Cron.vue'),
    name: 'cron',
  },
  {
    path: '/tools/dev/case-converter',
    component: () => import('../components/Tools/Dev/CaseConverter/CaseConverter.vue'),
    name: 'caseConverter',
  },
  {
    path: '/tools/text/lorem-ipsum',
    component: () => import('../components/Tools/LoremIpsum/LoremIpsum.vue'),
    name: 'loremIpsum',
  },
  {
    path: '/tools/dev/keyboard-test',
    component: () => import('../components/Tools/Dev/KeyboardTest/KeyboardTest.vue'),
    name: 'keyboardTest',
  },
  // AI 简历旧地址兼容：正式入口已迁移到独立 Next.js 应用。
  {
    path: '/tools/ai/resume',
    component: standaloneRedirectComponent,
    name: 'aiResume',
    beforeEnter: () => AI_RESUME_RELEASE_ENABLED
      ? redirectToStandaloneTool('/tools/ai-resume')
      : '/',
  },
  // AI 简历未开启时的同域路径兜底；开启后由 Vite/Nginx 在 Vue Router 前转发。
  {
    path: '/tools/ai-resume/:pathMatch(.*)*',
    component: standaloneRedirectComponent,
    name: 'aiResumeStandaloneFallback',
    beforeEnter: () => '/',
  },
  {
    path: '/tools/ai-perler',
    component: () => import('../components/Tools/AI/PerlerReactHost.vue'),
    name: 'aiPerler',
    meta: {
      title: '拼豆图纸生成器',
      description: '上传图片生成可编辑的拼豆图纸、色号统计和采购清单。'
    }
  },
  {
    path: '/tools/ai-perler/focus',
    component: () => import('../components/Tools/AI/PerlerReactHost.vue'),
    name: 'aiPerlerFocus',
    props: {
      mode: 'focus'
    },
    meta: {
      title: '专心拼豆',
      hideToolsRecommend: true
    }
  },
  {
    path: '/tools/radar',
    component: () => import('../components/Tools/Chart/Radar/Radar.vue'),
    name: 'radar',
  },
  {
    path: '/tools/funnel',
    component: () => import('../components/Tools/Chart/Funnel/Funnel.vue'),
    name: 'funnel',
  },
  {
    path: '/tools/gauge',
    component: () => import('../components/Tools/Chart/Gauge/Gauge.vue'),
    name: 'gauge',
  },
  // 数据换算工具
  {
    path: '/tools/calculation/mortgage-rate',
    component: () => import('../components/Tools/Calculation/MortgageRate.vue'),
    name: 'mortgageRate',
  },
  {
    path: '/tools/calculation/investment',
    component: () => import('../components/Tools/Calculation/Investment.vue'),
    name: 'investment',
  },
  {
    path: '/tools/calculation/social-insurance',
    component: () => import('../components/Tools/Calculation/SocialInsurance.vue'),
    name: 'socialInsurance',
  },
  {
    path: '/tools/calculation/temperature',
    component: () => import('../components/Tools/Calculation/Temperature.vue'),
    name: 'temperature',
  },
  {
    path: '/tools/calculation/mortgage',
    component: () => import('../components/Tools/Calculation/Mortgage.vue'),
    name: 'mortgage',
  },
  {
    path: '/tools/calculation/bmr',
    component: () => import('../components/Tools/Calculation/BMR/BMR.vue'),
    name: 'bmr',
  },
  // 生活常用工具
  {
    path: '/tools/daily/flip-clock',
    component: () => import('../components/Tools/Daily/FlipClock/FlipClock.vue'),
    name: 'flipClock',
  },
  {
    path: '/tools/daily/weather',
    component: () => import('../components/Tools/Daily/Weather/index.vue'),
    name: 'weather',
  },
  {
    path: '/tools/daily/car-price',
    component: () => import('../components/Tools/Life/CarPrice.vue'),
    name: 'carPrice',
  },
  {
    path: '/tools/daily/bmi',
    component: () => import('../components/Tools/Daily/Bmi/index.vue'),
    name: 'bmi',
  },
  {
    path: '/tools/daily/stopwatch',
    component: () => import('../components/Tools/Daily/Stopwatch/index.vue'),
    name: 'stopwatch',
  },
  {
    path: '/tools/daily/age-calculator',
    component: () => import('../components/Tools/Daily/AgeCalculator/index.vue'),
    name: 'ageCalculator',
  },
  {
    path: '/tools/daily/life-progress',
    component: () => import('../components/Tools/Daily/LifeProgress/index.vue'),
    name: 'lifeProgress',
  },

  // 效率工具
  {
    path: '/tools/todo-list',
    component: () => import('../components/Tools/TodoList/index.vue'),
    name: 'todoList',
  },
  {
    path: '/tools/pomodoro',
    component: () => import('../components/Tools/Pomodoro/index.vue'),
    name: 'pomodoro',
  },
  {
    path: '/tools/image-color',
    component: () => import('../components/Tools/ImageColor/ImageColor.vue'),
    name: 'imageColor',
  },
  {
    path: '/tools/percentage',
    component: () => import('../components/Tools/Calculation/Percentage/Percentage.vue'),
    name: 'percentage',
  },
  {
    path: '/tools/calculation/discount',
    component: () => import('../components/Tools/Calculation/Discount/Discount.vue'),
    name: 'discount',
  },
  {
    path: '/tools/design/glassmorphism',
    component: () => import('../components/Tools/Design/Glassmorphism/Glassmorphism.vue'),
    name: 'glassmorphism',
  },
  {
    path: '/tools/image-to-base64',
    component: () => import('../components/Tools/ImageToBase64/ImageToBase64.vue'),
    name: 'imageToBase64',
  },
  {
    path: '/tools/design/gradient',
    component: () => import('../components/Tools/Design/Gradient/Gradient.vue'),
    name: 'gradient',
  },
  {
    path: '/tools/web/meta-tags',
    component: () => import('../components/Tools/Web/MetaTags/MetaTags.vue'),
    name: 'metaTags',
  },
  {
    path: '/tools/dev/sql-format',
    component: () => import('../components/Tools/Dev/SqlFormat/SqlFormat.vue'),
    name: 'sqlFormat',
  },
  {
    path: '/tools/web/info',
    component: () => import('../components/Tools/WebInfo/WebInfo.vue'),
    name: 'webInfo',
  },
  {
    path: '/tools/design/web-ui-spec',
    name: 'webUISpec',
    component: () => import('../components/Tools/Design/WebUISpec/WebUISpec.vue'),
  },
  {
    path: '/tools/design/typography-spec',
    name: 'typographySpec',
    component: () => import('../components/Tools/Design/TypographySpec/TypographySpec.vue'),
  },
  {
    path: '/tools/design/color-spec',
    name: 'colorSpec',
    component: () => import('../components/Tools/Design/ColorSpec/ColorSpec.vue'),
  },
  {
    path: '/tools/audio/recorder',
    component: () => import('../components/Tools/Audio/VoiceRecorder/VoiceRecorder.vue'),
    name: 'voiceRecorder',
  },
  {
    path: '/tools/audio/converter',
    component: () => import('../components/Tools/Audio/AudioConverter/AudioConverter.vue'),
    name: 'audioConverter',
  },
  {
    path: '/tools/video/rotate',
    component: () => import('../components/Tools/Video/VideoRotate/VideoRotate.vue'),
    name: 'videoRotate',
  },
  {
    path: '/tools/video/crop',
    component: () => import('../components/Tools/Video/VideoCrop/VideoCrop.vue'),
    name: 'videoCrop',
  },
  {
    path: '/tools/video/trimmer',
    component: () => import('../components/Tools/Video/VideoTrimmer/VideoTrimmer.vue'),
    name: 'videoTrimmer',
  },
  {
    path: '/tools/video/to-audio',
    component: () => import('../components/Tools/Video/VideoToAudio/VideoToAudio.vue'),
    name: 'videoToAudio',
  },
  {
    path: '/tools/audio/volume-booster',
    component: () => import('../components/Tools/Audio/VolumeBooster/VolumeBooster.vue'),
    name: 'volumeBooster',
  },
  {
    //重定向
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'Any'
  }
]
