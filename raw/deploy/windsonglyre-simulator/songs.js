var tutorial = `教程
（第一行填写曲名）
（教程也可以播放，点击下方播放按钮）
教程中拍号4/4，此时一位表示一个四分音符：
/AAAA/..../
（斜杠是小节线标记，方便阅读，播放时会忽略）

英文句号表示休止符：
/AA.A/..../

三个八度音阶：ZXCV/BNM./ASDF/GHJ./QWER/TYU./..../
（即键盘上三排从左到右每排七个音分别对应do至si）

全局力度调整：按下键盘加号/减号使力度调高/低一档

[]内两个音占一拍（括号内时值为括号外的 1/2）
[ZCBADGQE]/..../

()内所有音同时发声
柱式和弦：(ZCB).(CBA).(BAD).(ADG).(ZCBADGQET)......./

{}内三个音占两拍（括号内时值为括号外的 2/3）
[(ZA)AAA][(ZD)DDD]/{(ZA)AA}[(ZG)GGG]/..../..../

以上的括号均能多层嵌套

例如：
[(XG)[(MG)H](BJ)(BW)][(RF)[GE](BW)[SQ]][(XJ)[(BJ)Q](BMW)JVGF.]..../

自动播放时力度临时调整：< / >

渐强：A < A < A < A < A < A....
渐弱：A > A > A > A > A > A > A > A > A > A > A ....
渐强：A < A < A < A < A < A....
是不是很像一个渐强/渐弱符号 （笑

三连音示例：
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
>]..../..../

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

但是想要忽略特定的有效字符怎么办？

使用注释符号：#
一行中 # 后的内容全部忽略！

`;
var tutorial2 = `教程
副音轨在播放时会跟主音轨同时播放
本节将展示在副音轨中根据和弦自动创建伴奏的方法。

####### 还没写呢，底下都是画饼，现在副音轨跟主音轨是一样的 ########

#### 创建一段织体模版：

# {1232} # 这是一段四拍的模版，123分别代表和弦的第1、2、3个音
# 
# # 将和弦填入这个模版：
# 
# /C/
# 
# # 为提高可读性，副音轨中使用音名 (CDEFGAB) 而非键位表示和弦
# # 当不指定和弦属性时，自动配上调内的三和弦，如此处和弦三个音分别是C,E,G
# # 可用的和弦属性：C/Cm/Csus2/Csus4/C7/Cm7/Cmaj7
# # 和弦转位：C,1/C,2 （分别为第一第二转位）
# 
# # 与主音轨不同的是，副音轨中小节线非常重要，一个小节的时间是固定的
# 
# ./././ # 小节线中内容为休止符，休息三个小节
# 
# #### 创建另一段织体模版并播放一个和弦进行
# 
# { [13435343] }
# 
# # 456是高八度的和弦音，以此类推，内部表示节奏的方法见上一节教程
# 
# C/A/F/G/C/./././
# 
# # 这一个模版同时也是默认模版，不指定模版内容时按这个播放，例：
# 
# {}D/G/C/F/B/E/A/./././
# 
# # 给模版命名
# 
# a=[13436453]
# b=[12346531]
# 
# {a}C/A/F{b}G/C/././
# 
# # 模版时间与实际时间不匹配时：循环播放，自动截断
# 
# {a}C/ /A/ /G/C/././
# 
# c=[13531353]
# {}F{c}G/C/{}F{c}G/C/ # 注意：小节线内有多个和弦时自动平均分配时间


`;
var bwv846 = 
`巴赫C大调前奏曲
[[>>ADGQEGQEADGQEGQE/ASHWRHWRASHWRHWR/
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
BSGJRGJRBSGJRGJR/B-DHQ+RHQ+RB-DHQ+RHQ+R/
BDGQTGQTBDGQTGQT/BSGQRGQRBSGQRGQR/
BSGJRGJRBSGJRGJR/ZAG-JEG-JEZAG-JEG-JE/
ZAFHQRQHQHFHFSFS/ZM%GJWRWJWJGJSFDS/]
(%ZA%DGQ)]
`;
var haruhikage = `春日影
# 来源：https://www.bilibili.com/read/cv27118373/
# 略有修改，使节奏正确。

[
前奏：
>
(AGE)...W.Q...W./(VAE)..RE.W.N.M./
(AGE).S.W.(GQ)...(AW)./(VADE)..R(AE).(FW)...../
(ZE).B.(AW).(SQ)...(AW)./(VE).ZR(AE).(SW)...A./
(ZE).B.(AW).(SQ)...(AW)./(VE).ZR(AE).(SW)...<(VA)A/

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

(ZVJ).(ZH).(VH).(DH).A.V./(ZV).Z.(VH).(DH).(AG).<(VF)F/
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
>
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
(ZBQ).Z.(BQ)W(ADW).A.(BW)Q/(ZBQ).Z.(BQ)E(ADE).A.<(BE)W/

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
(GQ)...(AW)./(VADE)..RE.(FW)...../](ZBDQ)...../

`;

var komorebi = `komorebi
a段：
(VH).AE/D.W./(BDJT).../(JE).../
(NGW).AE/D.(GQ)./(CGJ).M./(SG).../
(VH).(AE)./D.JQ/(BJ).XG/B.S./
(NAD).C./N.A./(BM).C./B.X./

(VH).AE/D.(AW)./(BT).M./(SE).M./
(NW).AE/D.(GQ)./(CJ).M./(DG).M./
(VH).(AE)./D.JQ/(BJ).XG/B.S./
(NAD).C./N.A./(BM).../..../

a1段：

(VH).AE/D.(AW)./(BT).M./(SE).M./
(NW).AE/D.(GQ)./(CJ).M./(DG).M./
(VDH).(AHE)./D.SD/(BSG).(MGE)./S.(MG)J/
(NDH).(AHE)./D.(AH)E/(CDH).(MHE)./D.(MH)E/

(VH).AE/D.(AW)./(BT).M./(SE).M./
(NW).AE/D.(GQ)./(CJ).M./(DG).M./
(VDH).(AHE)./FGHQ/(BSGJ).X/MSGJ/
(NDQ).A./(DH)J(GQ)T/(CJET).M/(DH)J(MW)T/

b段：

(VQ).A(GQ)./D.(AQ)./(BJ).MJ/SHM./
(NHQ).A(HQ)./D(GQ).(GJ)/C.M./(DG)J(MW)T./
(VGQ).A(QY)/.Q.W./(BWTU).XQ/UTWE./
(NW).AQ/DWGE./C.MG/(DJ)W(MT)J./

(VGQ).A(QT)/DQA./(BJW).M./(SH)J(MW)T./
(NGQ).A(GQ)/D.Q(QT)/CU(MQ)W./(DU)T(MW)T./
(VQEY).AQ/.FGQ./(BGJ).X(JT)/.JWQ./
(NQT).(AD)G/DG(AH)Q./(CD)G(MH)J./(DQ)T(MG)J./

(VQ).A(QT)/DQA./(BW).M./SH(MG)H./
(NQ).A(HQ)/D.GQ/(CGJ).M./(DG)J(MW)T./
(VGQ).A(QY)/.Q.W/(BWTU).XQ/UTWE./
(NW).AQ/DWGE./C.MG/(DJ)W(MT)J./

(VGQ).A(QT)/DQA./(BJW).M./(SH)J(MW)T./
(NGQ).A(GQ)/D.Q(QT)/CU(MQ)W./(DU)T(MW)T./
(VQEY).AQ/.FGQ/(BGJ).X(JT)/.JWQ/
(NQT).(AD)G/DG(AH)Q./(CGJ).M./HJ(MW)T./

a1段：

(VH).AE/D.(AW)./(BT).M./(SE).M./
(NW).AE/D.(GQ)./(CJ).M./(DG).M./
(VDH).(AHE)./D.SD/(BSG).(MGE)./S.(MG)J/
(NDH).(AHE)./D.(AH)E/(CDH).(MHE)./D.(MH)E/

(VH).AE/D.(AW)./(BT).M./(SE).M./
(NW).AE/D.(GQ)./(CJ).M./(DG).M./
(VDH).(AHE)./FGHQ./(BSGJ).X./MSGJ./
(NDQ).A./(DH)J(GQ)T./(CJET).M./(DH)J(MW)T./

c段：

(VWY).(AWY)(QT)./D(WT)(AE)Q./(BHE)WMW./(SGQ).(MGQ)J./
NJ(AG)./D.AG/(CSG).(MSG)A/D(AG)M./
(VWY).(AWY)(QT)./D(WT)(AE)Q./(BHE)WMW./(SGQ).(MGQ)J./
N(GJ)(AHQ)./DQ(GU)Q./CU(MT)W./(DQ)J(MG)S./

(VQT).(AQT)Q./DWA./(BG)JM(JT)./(SGQ).(MGW)./
(NHE).(AHE)W./DQA./C(GJ)M(GJ)./(DGQ).(MGW)./
(VQT).A(QT)./D.A./(BJT).M(JT)./S.M./
(NQT).A(QT)./D.G./(CJT).M(JT)./(DG)J(MW)T./

a1段：

(VH).AE/D.(AW)./(BT).M./(SE).M./
(NW).AE/D.(GQ)./(CJ).M./(DG).(MH)G./
(VDH).(AHE)./D.SD/(BSG).(MGE)./S.(MG)J/
(NDH).(AHE)./D.(AH)E/(CDH).(MHE)./D.(MH)E/

(VH).AE/D.(AW)./(BT).M./(SE).M./
(NW).AE/D.(GQ)./(CJ).M./(DG).(MH)G./
(VDH).(AHE)./FGHQ./(BSGJ).X./MSGJ./
(NDQ).A./(DH)J(GQ)T./(CJET).M./(DH)J(MW)T./

来源：https://www.bilibili.com/video/BV1s34y1H727

`;

var zenzenzense = `前前前世
[
>[{ASD}QGWGET][.QEQREQ.]
[{ASD}QGWGET][.QEQREQ.]
[{ASD}QGWGET][.QEQREQ.]
[[WETE]WQWGQ.]{(GQET)(GQET)(GQET)(GQET)(GQET)(GQET)}
[{ASD}QGWGEG][RGEGTGQG]
[{ASD}QGWGEG][RGEGWGEG]
[{ASD}QGWGEG][RGEGTGQG]
[[WETE]WQWGQ.](ADGQET)..B/
<[A..S]A./.B{FDS}/A.../..AS/[DSDFDSAS][DSDFD.SA]
]
`;

var sad_machine = {
    main: 
`Sad Machine（还没写完）
# 原曲：Porter Robinson
# 钢琴改编：Xeuphoria
# 扒谱：B站up主蓝莓夹心奥利奥
# 转写：我
[
>>
[E..E..]E.[UT]U[TR]/[E..E..]E.[UT]U[TR]/
[E..E..]E.[UT]U[TR]/[E..(QE)..](QE).[U^Q^]T[TR]/
[E..E..]E.[UT]U[TR]/[E..E..]E.[UT]U[TR]/
[E..E..]E.[UT]U[TR]/(QE)... ..../
<<
G... ...G/GHJD..../GHJA..(ADF)(AD)/

]

`,
    sub:
`>
(QE).../(QET).../(JR).../(HE).../
(QE).../(QET).../(JR).../(HE).../
`};
