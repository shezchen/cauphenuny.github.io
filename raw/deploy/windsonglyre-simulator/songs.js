var tutorial = `教程
教程中拍号4/4，此时一位表示一个四分音符：
/AAAA/..../
（斜杠是小节线标记，方便阅读，播放时会忽略）

英文句号表示休止符：
/AA.A/..../

三个八度音阶：ZXCV/BNM./ASDF/GHJ./QWER/TYU./..../
（即键盘上三排从左到右每排七个音分别对应do至si）

全局力度调整：按下键盘加号/减号使力度调高/低一档

[]内两个音占一拍（括号内时值为括号外的 1/2）
[ZCBADGQET]/..../

()内所有音同时发声
柱式和弦：(ZCB).(CBA).(BAD).(ADG).(ZCBADGQET)......./

{}内三个音占两拍（括号内时值为括号外的 2/3）

以上的括号均能多层嵌套

例如：
[B[BN]MS][F[.D]S[SA]][M[MA]SM.BV.]..../

自动播放时力度临时调整：</>

渐强：A < A < A < A < A < A....
渐弱：A > A > A > A > A > A > A > A > A > A > A ....
渐强：A < A < A < A < A < A....
是不是很像一个渐强/渐弱符号 （笑

三连音试例：
[ # 整体套了个中括号，相当于 bpm 翻倍变成180
>[{ASD}QGWGET][.QEQREQ.]
[{ASD}QGWGET][.QEQREQ.]
[{ASD}QGWGET][.QEQREQ.]
[[WETE]WQWGQ.]{(GQET)(GQET)(GQET)(GQET)(GQET)(GQET)}
[{ASD}QGWGEG][RGEGTGQG]
[{ASD}QGWGEG][RGEGWGEG]
[{ASD}QGWGEG][RGEGTGQG]
[[WETE]WQWGQ.](ADGQET)..B/
<[A..S]<A./.B{FDS}/A.../..AS/[DSDFDSAS][DSDFD.SA]
]..../..../

临时升降记号：
+/- 表示升/降半音，仅影响其后紧跟着的一个音
[AAAA-AAA-A][AAAA+AAA+A]/..../(ADG).../(A-DG).../..../
临时高/低八度记号：
^^内的音高八度 例：[AAGGHHG.FFDDSSA.][^AAGGHHG.FFDDSSA.^]..../
%%内的音低八度 例：[AAGGHHG.FFDDSSA.][%AAGGHHG.FFDDSSA.%]..../ （不可嵌套使用）

注意：此类变化音无法通过直接通过按键盘奏出

总结：
有效字符：
.()<>{[UYTREWQJHGFDSAMNBVCXZ]}-+%^
其他字符在自动播放时均忽略
`
var bwv846 = 
`[[>>ADGQEGQEADGQEGQE/ASHWRHWRASHWRHWR/
MSGWRGWRMSGWRGWR/ADGQEGQEADGQEGQE/
<<ADHEYHEYADHEYHEY/>>AS+FHW+FHWAS+FHW+FHW/
MSGWTGWTMSGWTGWT/>MADGQDGQMADGQDGQ/
NADGQDGQNADGQDGQ/XNS+FQS+FQXNS+FQS+FQ/
<BMSGJSGJBMSGJSGJ/<B-MDG+QDG+QB-MDG+QDG+Q/
<VNSHWSHWVNSHWSHW/>>V-NSFJSFJV-NSFJSFJ/
<CBAGQAGQCBAGQAGQ/>CVNAFNAFCVNAFNAF/
XVNAFNAFXVNAFNAF/%BSGJRGJRBSGJRGJR/
ADGQEGQEADGQEGQE/AG-JQE-JQEAG-JQE-JQE/
VFHQEHQEVFHQEHQE/+VAHQ-EHQ-E+VAHQ-EHQ-E/
-NFJQWJQW-NFJQWJQW/BFGJWGJWBFGJWGJW/
BDGQEGQEBDGQEGQE/BSGQRGQRBSGQRGQR/
BDGQEGQEBDGQEGQE/BSGQRGQRBSGQRGQR/
BSGJRGJRBSGJRGJR/B-DHQ+RHQ+RB-DHQ+RHQ+R/
BDGQTGQTBDGQTGQT/BSGQRGQRBSGQRGQR/
BSGJRGJRBSGJRGJR/ZAG-JEG-JEZAG-JEG-JE/
ZAFHQRQHQHFHFSFS][ZM%GJWRWJW]{JGJSF}DS
(%ZA%DGQ)]
`
var haruhikage = `[
# 注意拍号是6/8，而这里外层套了个中括号时值减半
# 所以以下每一位表示一个16分音符

前奏：

(AGE)...W.Q...W./(VAE)..RE.W.N.M./
(AGE).S.W.(GQ)...(AW)./(VADE)..R(AE).(FW)...../
(ZE).B.(AW).(SQ)...(AW)./(VE).ZR(AE).(SW)...A./
(ZE).B.(AW).(SQ)...(AW)./(VE).ZR(AE).(SW)...(VA)A/

主歌：

(ZD).(BD).S.(AF).D.(BS)./(VS).(ZS).AA(SF).D.(VS)./
(ZS).B.AS(AD)...B./(CA)...A.(BD).G.(DQ)./
(VJ).Z.(AQ).(GJ)...(DQ)./(BJ)H(XG).M.(DG).S.(SF)./
(CAF).Z.(BD).(AD)...(ZB)./(CAF).D.(ZS).(BD)...(DG)./

(VA).Z.N.(BM).X.A./(CNS).A..M(XBA).G.(BA)./
(VF).Z.(AD).(BS).(XA).A./(ZA).B.A.S.A.(BA)S/
(ZD).(BD).S.(AF).D.(BS)./(VS).(ZS).A.(SF).D.(VS)./
(ZS).B.AS(AD)...B./(CA)...A.(BD).G.(DQ)./

(VJ).Z.(AQ).(GJ)...(DQ)./(BJ)H(XG).M.(DG).S.(SF)./
(CAF).(ZD).(BD).(AD)...(ZB)./(CAF).D.(ZS).(BD)...(DG)./
(VA).Z.N.(BM).X.AA/(CNS).A...(XBA).G.(BA)./
(VF).(ZF)F(AD)S(BS).(XA).A./(ZA).B.A.D...../

(VAH).G.G.G.F.F./(BD).S.S.S...G./
(CSG).FFF.F.D.S./(CNS).A.AMA...../
(VAH).G.G.G.F.F./(BD).S.S.S...D./
(CSF).DDDDD.S.D./(NGW).D.(AQ).(BSQ).A.(BQ)./

(ZVJ).(ZH).(VH).(DH).A.V./(ZV).Z.(VH).(DH).(AG).(VF)F/
(XBF).X.(BD).(SD)F(BG).X./(XB).X.B.(MS).B.(XB)./

副歌：

(ZD)S(BD)SDF(ADG).S.(BF)G/(ZVH).Z.HJ(AFQ).N.(VW)Q/
(CBG).C.B.(MSG).(BF).(CF)./(CND).C.(NF)D(ADG).S.B./

(ZD)S(BD)SD.(ADG).S.(BF)G/(ZVH).Z.AH(CMJ).C.DD/
(CBE).(CE).ME(DGR).E.(MW)./(CNW).C.QJ(ADQ).S.(XBG)Q/

(ZVW).(ZQ).(AQ).(FQ).A.(VG)./(XBW).(XQ).(SQ).(GQ).S.(BG)Q/
(ZBW).(ZQ).(BQ).(ADQ).A.(BG)Q/(ZBW).AE(DW).(GQ).A.(BQ)./

(ZVJ).(ZH).(AH).(FH).A.(VG)./(XBG).X.(MF).(SF).(MD).(BS)./
(ZBD).B.A.S.A.B./(ZVD).(NF).(AD).(XBF).(XD).(MS)./

(ZBA).AZB.(ZBS)...(ZA)./(ZB).AZB.F.D.AS/

主歌：

(ZBD).D.S.F.D.S./(ZVS).S.AA(SF).(AD).(VS)./
(ZS).B.AS(AD)...B./(CA)...A.(BD).G.(DQ)./
(VJ).Z.(AQ).(GJ)...(DQ)./(BJ)H(XG).M.(DG).S.(SF)./
(CAF).(ZD).(BD).(AD)...Z./(CAF).D.(ZS).(BD)...(DG)./

(VA).Z.N.(BM).X.AA/(CNS).A...(XBA).G.(BA)./
(VF).Z.(AD).(BS).X.A./(ZA).B.A.S.A.B./

(VAH).G.G.G.F.F./(BD).S.S.S...G./
(CSG).FFF.F.D.S./(CNS)...AMA...../
(VAH).G.G.G.F.F./(BD).S.S.S...D./
(CSF).DDDDD.S.D./(NGW).D.(AQ).(BSQ).A.(BQ)./

(ZVJ).Z.(VH).(DH).A.V./(ZV).Z.(VH).(DH).(AG).(VF)F/
(XBF).X.(BD).(SD)F(BG).X./(XB).X.B.(MS).B.(XB)./

间奏：

(ZVF).(ZH)Q(VE).(AD).(AQ).(VF)./(ZVF).(ZH).(VE).(AD).(AH).(VF)./
(ZBQ).Z.(BQ)W(ADW).A.(BW)Q/(ZBQ).Z.(BQ).(ADQ).(AQ).(BQ)./
(ZVF).(ZH)Q(VE).(AD).(AQ).(VF)./(ZVF).(ZH).(VE).(AD).(AH).(VF)./
(ZBQ).Z.(BQ)W(ADW).A.(BW)Q/(ZBQ).Z.(BQ)E(ADE).A.(BE)W/

桥段：

(ZVW)Q(ZQ)Q(VQ)Q(ADE).(AQ).V./(ZVW)Q(ZQ)Q(VQ)Q(ADW).(AQ).(VQ)H/
(ZBG).(ZE).B.(AD).A.B./(ZB).Z.B.(AD).A.B./
(ZVW)Q(ZQ)Q(VQ)Q(ADE).(AQ).V./(ZVW)Q(ZQ)Q(VQ)Q(ADW).(AQ).(VQ)H/
(ZBG).(ZE).(BW).(ADW).A.B./(XBW)W(XW).(BG)G(ADW).A.(BQ)./

(VAQ).....Q.Q.Q./(AQ)QW.Q.WWQ.../
(BS).....(JW).(JW)(HQ)(JW)./(BSW).(BSE).(BSW).(XBE).(XB).(BR)./

间奏：

(ZBGE).Z.B.(AD).A.B./(ZV).Z.V.(AD).A.V./
(CBT).(CT).(MT).(DGT).(ME).(CW)./(CNQ).(CJ).(NJ).(ADJ).(NJ).(CJ)./
(ZBE).Z.(BW).(ADW).(AQ).(BG)./(ZVH).Z.V.(CM).C.M./
(MD).M.C.(MJ).(CJ).(MJ)./(MDQ).(MDJ).(MD)G(CMG).(CS).(CD)./

副歌：

(ZD)S(BD)SDF(ADG).S.(BF)G/(ZVH).Z.HJ(AFQ).N.(VW)Q/
(CBG).C.B.(MSG).(BF).(CF)./(CND).C.(NF)D(ADG).S.B./

(ZD)S(BD)SD.(ADG).S.(BF)G/(ZVH).Z.AH(CMJ).C.DD/
(CBE).(CE).ME(DGR).E.(MW)./(CNW).C.QJ(ADQ).S.(XBG)Q/

(ZVW).Z.(AQ).(FQ).A.(VG)./(ZBW).Z.(BQ).(ADQ).A.(BG)Q/
(ZVW).(ZQ).(VQ).(ADQ).A.(VG)Q/(ZBW).AE(DW).(GQ).A.(BQ)./

(ZVJ).(ZH).(AH).(FH).A.(VG)./(XBG).X.(MF).(SF).(MD).(BS)./
(ZBD).B.A.S.A.B./(ZVD).(NF).(AD).(XBF).(XD).(MS)./

(ZBA).AZB.(ZBS)...(ZA)./(ZVF).(NF).A.(XBG).X.(MQ)./
(ZBQ).AZB.(ZBS)...(ZA)./(ZVQ).(NW).(AQ).(XBW).(XQ).(MW)./

(AGQE)...W.Q...W./(VAE)..RE.W.N.M./(AGE).S.W.
(GQ)...(AW)./(VADE)..RE.(FW)...../......(ZBDQ)....../
]

---
来源：https://www.bilibili.com/read/cv27118373/
略有修改，使节奏正确。
`
