<h1>D3｜胰液、胆汁与小肠消化</h1>
<p>本地准备稿。沿同一模型展开与压缩；冲突仅冻结其依赖答案。原始Source、Recall与完成证据仍各自独立。</p>
<section class="model-node" id="d3-node-1">

<h2>先给环境和工具，再看激活地点</h2>
<p>酸性食糜进入十二指肠后，胰导管给HCO₃⁻和水，中和并冲洗；腺泡给消化工具。体液调节为主仍有神经协同。 <span class="binding" data-kp="digestive-d3-kp02" data-candidate-conflict="true">胰液双细胞模型：腺泡给酶，导管给碱性水〔最强消化液｜腺泡 vs 导管｜分泌物｜神经｜功能2｜调节主导〕</span></p>
<p>HCl—S细胞—促胰液素偏向导管碱性水；蛋白产物—I细胞—CCK偏向腺泡酶，并收缩胆囊、舒张Oddi。环境和酶量须协同，二者都限制胃继续过快交货。 <span class="binding" data-kp="digestive-d3-kp04" data-candidate-conflict="false">促胰液素 vs CCK：一个“冲水中和”，一个“放酶挤胆囊”〔来源/刺激各1｜第二信使｜胰液成分各1｜胆囊/Oddi｜协同〕</span></p>
<p>刷状缘肠激酶启动胰蛋白酶原；胰蛋白酶自激并激活糜蛋白酶原、羧基肽酶原。激活地点错到胰内会造成自我消化。RNase/DNase是否进入这条酶原链仍被两版争议，不能由此推成“全部胰酶都按同一规则”。 <span class="binding" data-kp="digestive-d3-kp03" data-candidate-conflict="true">胰酶原激活：必须在肠腔启动的级联保险〔首个酶原｜首激活酶｜自激｜下游酶原3+｜安全意义｜提前激活后果〕</span></p>
<p class="hold" data-hold="D3-02">绑定冲突：恢复Current原Prompt；候选能力范围检索轴未采纳。</p>

<p class="hold" data-hold="D3-03">RNase/DNase HOLD：Current把核糖核酸酶原、脱氧核糖核酸酶原放入胰蛋白酶激活链；候选用外部来源校正为活性酶分泌。两项及“全部酶原”推论冻结，独立蛋白酶级联继续；D20不得继承争议答案。</p>

<details class="explanation"><summary>展开这一段的机制、比较与完整细节</summary>

<h3>胰液双细胞模型：腺泡给酶，导管给碱性水</h3>
<h3>1｜两类细胞</h3>
<table>
<thead>
<tr>
<th>细胞</th>
<th>主要分泌</th>
<th>直接任务</th>
</tr>
</thead>
<tbody><tr>
<td>胰腺腺泡细胞</td>
<td>各类胰酶 / 酶原</td>
<td>分解糖、脂肪、蛋白质和核酸</td>
</tr>
<tr>
<td>胰管 / 导管细胞</td>
<td>HCO₃⁻ + 水</td>
<td>中和胃酸，提供胰酶适宜 pH，冲洗酶入十二指肠</td>
</tr>
</tbody></table>
<h3>2｜为什么胰液偏碱</h3>
<p>胃排出的食糜含 HCl。若不先中和：</p>
<ul>
<li>小肠黏膜受到酸损伤；</li>
<li>胰酶难以在合适环境工作。</li>
</ul>
<p>因此 HCO₃⁻不是“附带成分”，而是酶解能够顺利进行的前置条件。</p>
<h3>3｜调节性质</h3>
<p>胰液分泌以<strong>体液调节为主</strong>，但神经与体液协同：</p>
<ul>
<li>迷走 ACh / 胃泌素样作用：主要作用于腺泡、酶多水少；</li>
<li>促胰液素：偏导管、HCO₃⁻和水；</li>
<li>CCK：偏腺泡、胰酶；</li>
<li>内脏大神经属交感神经，对胰液分泌影响不明显。</li>
</ul>
<p>（易混：不能把“胰液分泌以体液为主”理解为没有神经调节。）</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L160">当前完整知识与出处</a></p>
<h3>促胰液素 vs CCK：一个“冲水中和”，一个“放酶挤胆囊”</h3>
<h3>1｜促胰液素 Secretin</h3>
<pre><code class="language-text">十二指肠HCl（最强）
+ 蛋白质消化产物、脂肪酸
→ 小肠上部S细胞
→ 促胰液素
→ cAMP
→ 胰管细胞：HCO₃⁻ + 水↑↑
</code></pre>
<p>同时：</p>
<ul>
<li>促进胆管上皮分泌水和 HCO₃⁻；</li>
<li>抑制胃酸和胃排空；</li>
<li>对胰外分泌部有营养作用。</li>
</ul>
<h3>2｜CCK / 促胰酶素</h3>
<pre><code class="language-text">蛋白质消化产物（最强）
+ HCl、脂肪酸
→ 小肠上部I细胞
→ CCK
→ Ca²⁺信号
→ 胰腺腺泡：胰酶↑↑
→ 胆囊收缩 + Oddi括约肌舒张
</code></pre>
<p>还可：</p>
<ul>
<li>促进胆汁排出；</li>
<li>抑制胃运动和胃排空；</li>
<li>总体抑制胃酸；</li>
<li>促进胃蛋白酶原；</li>
<li>对胰外分泌部有营养作用。</li>
</ul>
<h3>3｜协同</h3>
<p>促胰液素和 CCK 不是各自独立：一个提供碱性液体和适宜环境，一个提供酶；共同使胰液既“有量”又“有消化力”。迷走神经还能增强体液激素作用。</p>
<h3>4｜抑制轴</h3>
<p>当前 Study 列出：</p>
<ul>
<li>生长抑素；</li>
<li>胰高血糖素；</li>
<li>胰多肽；</li>
</ul>
<p>可抑制胰液分泌，进入 MI-D。</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L237">当前完整知识与出处</a></p>
<h3>胰酶原激活：必须在肠腔启动的级联保险</h3>
<h3>1｜启动顺序</h3>
<pre><code class="language-text">小肠刷状缘肠激酶 / 肠肽酶
→ 胰蛋白酶原 → 胰蛋白酶
</code></pre>
<p>随后胰蛋白酶：</p>
<ul>
<li>自催化激活更多胰蛋白酶原；</li>
<li>激活糜蛋白酶原；</li>
<li>激活羧基肽酶原；</li>
</ul>
<p class="hold">RNase/DNase子项HOLD：Current与候选原句见冲突证据；不作为已定答案。</p>

<h3>2｜为什么先以酶原形式分泌</h3>
<p>胰腺必须把“生产消化酶”和“消化底物”空间分开：</p>
<pre><code class="language-text">胰腺内：安全合成、储存、运输酶原
小肠腔：遇到肠激酶后集中激活
</code></pre>
<p>否则蛋白酶会消化胰腺自身。</p>
<h3>3｜//串联：急性胰腺炎</h3>
<pre><code class="language-text">胰内酶原提前激活
→ 胰蛋白酶级联失控
→ 胰腺自我消化
→ 水肿、坏死、出血及全身炎症接口
</code></pre>
<p>当前只建立“提前激活”的机制门槛；完整病因、分级、并发症与治疗归 D20。</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L194">当前完整知识与出处</a></p>
</details>

</section>

<section class="model-node" id="d3-node-2">

<h2>胆汁提供脂肪处理条件，胆囊调度供给</h2>
<p>肝持续产胆汁、胆管加水碱，胆囊储存浓缩并按餐释放；胆汁本身不含消化酶。 <span class="binding" data-kp="digestive-d3-kp05" data-candidate-conflict="true">胆汁的生产—储存—排出：肝持续生产，胆囊按餐调度〔产地2｜胆囊2功能｜肝胆汁vs胆囊胆汁｜消化/非消化路径｜Oddi门控｜无酶〕</span></p>
<p>胆盐乳化脂滴、形成混合微胶粒，辅脂酶锚定胰脂肪酶，胰脂肪酶负责水解。微胶粒把脂质递送到顶端膜，这与上皮内形成乳糜微粒是不同位置。 <span class="binding" data-kp="digestive-d3-kp06" data-candidate-conflict="true">胆盐—辅脂酶—混合微胶粒：脂肪消化需要三个不同角色〔胆盐2作用｜辅脂酶1作用｜胰脂肪酶1作用｜微胶粒过静水层｜胆盐是否入细胞〕</span></p>
<p>胆盐经回肠重吸收、门静脉回肝，维持胆盐池；回肝胆盐促分泌不等于直接挤胆囊。切胆囊后肝仍产胆汁，但大量脂肪的集中处理可能受限，其他胆道仍可结石。 <span class="binding" data-kp="digestive-d3-kp07" data-candidate-conflict="false">肠肝循环与胆囊调节：胆盐反复使用，CCK负责“挤”和“开门”〔回收部位｜回肝路径｜意义｜CCK 2动作｜Secretin作用｜切胆囊边界〕</span></p>
<p class="hold" data-hold="D3-05">绑定冲突：恢复Current原Prompt；候选去计数未采纳。</p>

<p class="hold" data-hold="D3-06">微胶粒措辞HOLD：保留Current共同支持的脂质顶端递送和回肠胆盐回收；Framework“准备进入上皮”的指代及候选“整颗吞入”限定未作新的医学/Source采纳。</p>

<details class="explanation"><summary>展开这一段的机制、比较与完整细节</summary>

<h3>胆汁的生产—储存—排出：肝持续生产，胆囊按餐调度</h3>
<h3>1｜生产与储存</h3>
<ul>
<li>肝细胞持续产生胆汁；</li>
<li>肝内胆管上皮可增加水和 HCO₃⁻；</li>
<li>非消化期胆汁进入胆囊储存、浓缩；</li>
<li>消化期经胆总管进入十二指肠。</li>
</ul>
<h3>2｜胆囊的角色</h3>
<p>胆囊：</p>
<ul>
<li>储存胆汁；</li>
<li>吸收水和电解质、浓缩胆汁；</li>
<li>在进食后收缩，将胆汁送入肠腔。</li>
</ul>
<p>胆囊不是胆汁的生产器官。</p>
<h3>3｜肝胆汁与胆囊胆汁</h3>
<ul>
<li>肝胆汁偏弱碱性；</li>
<li>胆囊吸收 HCO₃⁻等后，胆囊胆汁可偏弱酸性；</li>
<li>胆囊胆汁因水被吸收而更浓。</li>
</ul>
<h3>4｜重要边界</h3>
<p>胆汁<strong>不含与消化有关的酶</strong>。它通过胆盐等物理化学作用帮助脂肪消化和吸收。</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L295">当前完整知识与出处</a></p>
<h3>胆盐—辅脂酶—混合微胶粒：脂肪消化需要三个不同角色</h3>
<h3>1｜胆盐：乳化 + 运输准备</h3>
<p>胆盐具有双嗜性：</p>
<ul>
<li>降低脂滴表面张力，把大脂滴分散成小脂滴，增加酶接触面积；</li>
<li>与脂肪酸、一酰甘油、胆固醇、脂溶性维生素等形成混合微胶粒。</li>
</ul>
<h3>2｜胰脂肪酶：真正水解</h3>
<p>胰脂肪酶负责水解三酰甘油，产生脂肪酸和一酰甘油等。</p>
<h3>3｜辅脂酶：把酶固定在脂滴表面</h3>
<p>胆盐覆盖脂滴后可能把胰脂肪酶从表面排开；辅脂酶的作用是<strong>锚定胰脂肪酶，防止其被清除</strong>。</p>
<p>（易混：辅脂酶不直接水解脂肪，也不是“激活胰脂肪酶”的主要答案；其关键是锚定。）</p>
<h3>4｜混合微胶粒</h3>
<pre><code class="language-text">脂肪消化产物 + 胆盐
→ 混合微胶粒
→ 通过小肠上皮表面的静水层
→ 把脂质递送到顶端膜
</code></pre>
<p>微胶粒递送脂质至顶端膜；胆盐在回肠重吸收。有关“整颗吞入”的候选新限定未采纳。</p>
<h3>5｜结石接口</h3>
<p>胆盐、卵磷脂帮助胆固醇溶解。Study 口径中胆盐 : 卵磷脂约 <strong>2–3 : 1</strong>有利于胆固醇保持溶解；比例失衡可促胆固醇析出和结石形成。</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L329">当前完整知识与出处</a></p>
<h3>肠肝循环与胆囊调节：胆盐反复使用，CCK负责“挤”和“开门”</h3>
<h3>1｜肠肝循环</h3>
<pre><code class="language-text">肝脏分泌胆盐入胆汁
→ 十二指肠参与脂肪处理
→ 回肠重吸收
→ 门静脉回肝
→ 再分泌入胆汁
</code></pre>
<p>意义：</p>
<ul>
<li>节省胆盐合成；</li>
<li>维持胆盐池；</li>
<li>回肝胆盐对胆汁分泌有促进作用，即利胆效应。</li>
</ul>
<p>（易混：讲义强调胆盐对胆汁分泌有促进作用，但对胆囊运动没有明显直接作用；胆囊运动的核心激素是 CCK。）</p>
<h3>2｜餐后胆汁排出</h3>
<ul>
<li>CCK：胆囊强烈收缩 + Oddi 括约肌舒张；</li>
<li>促胰液素：促进胆管上皮分泌 HCO₃⁻和水；</li>
<li>迷走与胃泌素也有较弱促进接口。</li>
<li>食物刺激胆汁分泌的强度按当前 Study：<strong>蛋白质 &gt; 脂肪 &gt; 糖</strong>。</li>
</ul>
<h3>3｜胆囊切除后的边界</h3>
<ul>
<li>肝仍持续产生胆汁，故一般消化可维持；</li>
<li>失去集中储存和餐后大量释放，摄入大量脂肪时消化能力可能下降；</li>
<li>不会再形成胆囊结石，但其他胆道部位仍可形成结石。</li>
</ul>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L368">当前完整知识与出处</a></p>
</details>

</section>

<section class="model-node" id="d3-node-3">

<h2>混合、推进与水盐回收各有位置</h2>
<p>小肠分节运动以环形肌节律收缩混匀食糜、增加黏膜接触并促进血淋巴回流；频率梯度有远端倾向，大距离推进主要靠蠕动，空腹MMC承担清扫。 <span class="binding" data-kp="digestive-d3-kp08" data-candidate-conflict="true">小肠运动：分节运动负责“混”，蠕动负责“送”〔运动5类｜特有1｜分节来源/时相/梯度｜4意义｜MMC Recall〕</span></p>
<p>大肠袋状往返延长水盐回收时间，集团蠕动可在餐后反射推动下把内容物送向直肠。细菌发酵残渣并合成K/B族维生素；具体运动类别计数与候选补项仍待原owner核对。 <span class="binding" data-kp="digestive-d3-kp09" data-candidate-conflict="true">大肠运动与细菌：慢速回收水盐，餐后集中推进〔运动4类｜袋状往返特点｜集团蠕动触发｜胃/小/大共同轴｜细菌产物/维生素〕</span></p>
<p class="hold" data-hold="D3-08">运动计数HOLD：Current Prompt“运动5类”而正文列六项；候选去计数未采纳。功能分工继续，数目答案冻结。</p>

<p class="hold" data-hold="D3-09">运动列表HOLD：Current本KP列四项，Current非KP比较又列三段共有蠕动；候选将蠕动加入本表并去计数未采纳。不得从布局裁定完整类别数。</p>

<details class="explanation"><summary>展开这一段的机制、比较与完整细节</summary>

<h3>小肠运动：分节运动负责“混”，蠕动负责“送”</h3>
<h3>1｜主要运动形式</h3>
<ul>
<li>紧张性收缩；</li>
<li>消化间期 MMC；</li>
<li>蠕动；</li>
<li>逆蠕动；</li>
<li>蠕动冲；</li>
<li>分节运动。</li>
</ul>
<h3>2｜分节运动</h3>
<p>分节运动是小肠特有且最有利于消化吸收的运动形式。</p>
<ul>
<li>主要由<strong>环形肌</strong>节律性收缩形成；</li>
<li>主要发生在消化期；</li>
<li>上段频率高、下段频率低，形成向远端的总体推进倾向。</li>
</ul>
<h3>3｜四类意义</h3>
<ol>
<li>使食糜与消化液充分混合；</li>
<li>反复接触黏膜，提高消化和吸收机会；</li>
<li>挤压肠壁血管和淋巴管，促进血液 / 淋巴回流；</li>
<li>通过频率梯度帮助内容物逐渐向远端移动。</li>
</ol>
<p>（易混：分节运动以混合为主，不是大距离推进的主要形式。）</p>
<h3>4｜MMC Recall</h3>
<p>胃和小肠共有消化间期 MMC，继续承担“清道夫”作用。</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L406">当前完整知识与出处</a></p>
<h3>大肠运动与细菌：慢速回收水盐，餐后集中推进</h3>
<p class="hold">完整运动列表计数HOLD；具体功能见下。</p>

<h3>2｜袋状往返运动</h3>
<ul>
<li>内容物在结肠袋之间缓慢往返；</li>
<li>长距离推进少；</li>
<li>有利于水、Na⁺、Cl⁻等吸收。</li>
</ul>
<h3>3｜集团蠕动</h3>
<ul>
<li>强而长距离的推进；</li>
<li>常在早餐后出现；</li>
<li>可由胃—结肠 / 十二指肠—结肠反射及 ENS 参与；</li>
<li>把内容物推向直肠，形成排便入口。</li>
</ul>
<h3>4｜大肠细菌</h3>
<p>可：</p>
<ul>
<li>发酵 / 腐败食物残渣；</li>
<li>产生脂肪酸、气体、吲哚等；</li>
<li>合成维生素 <strong>K 和 B 族</strong>。</li>
</ul>
<p>（特殊：当前题纲问“不产生维生素 C”。）</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L443">当前完整知识与出处</a></p>
</details>

</section>

<section class="model-node" id="d3-node-4">

<h2>换靶点就要重读方向，再从结果定位</h2>
<p>胃泌素、促胰液素、CCK须沿同一组靶点比较：胃酸/排空、LES、胰液、胆囊和营养作用。胃泌素促胃运动，CCK收胆囊却抑胃运动；GIP只在此保留D7前馈入口。小肠精确效应的候选新增表述缺Current完整表支持，留待Source核对。 <span class="binding" data-kp="digestive-d3-kp10" data-candidate-conflict="true">胃泌素—促胰液素—CCK：三激素用共同轴比较〔来源3｜最强刺激3｜营养作用｜LES｜胃酸/排空｜胰液｜胆囊｜小肠〕</span></p>
<p>缺胃液、缺胰液和缺胆汁损害不同：胃内蛋白初消化可被后续部分承接，胰液不足影响多类材料而脂肪突出，胆汁不足突出脂类及ADEK。 <span class="binding" data-kp="digestive-d3-kp01" data-candidate-conflict="false">三种消化液缺失：先判断“哪类营养物最受影响”〔胃液缺乏｜胰液缺乏｜胆汁缺乏｜糖/蛋白/脂肪/ADEK方向〕</span></p>
<p>脂肪泻不能唯一指向一个器官：先分中和环境、胰酶水解、胆盐递送和运动接触，再交D4追踪黏膜进入、细胞内加工及血/淋巴输出。 <span class="binding" data-kp="digestive-d3-kp11" data-candidate-conflict="false">从症状反推故障位置：中和、酶解、胆盐还是运动〔酸未中和｜酶不足｜胆盐不足｜运动异常｜脂肪泻4入口｜下一步D4〕</span></p>
<p class="hold" data-hold="D3-10">小肠效应Source gap：Current正式Prompt含“小肠”，共同轴表未给完整三激素小肠效应；候选teaching称P237提供分泌/运动方向，不构成Current支持。该精确子答案不生成Memory。</p>

<details class="explanation"><summary>展开这一段的机制、比较与完整细节</summary>

<h3>胃泌素—促胰液素—CCK：三激素用共同轴比较</h3>
<h3>1｜来源、分泌方式与最强刺激</h3>
<p>三者均由胃肠黏膜内分泌细胞释放，主要经血液到达靶细胞，属于胃肠激素的内分泌调节。</p>
<table>
<thead>
<tr>
<th>激素</th>
<th>主要来源</th>
<th>代表最强刺激</th>
</tr>
</thead>
<tbody><tr>
<td>胃泌素</td>
<td>胃窦幽门部 G 细胞</td>
<td>GRP、蛋白质消化产物、胃扩张</td>
</tr>
<tr>
<td>促胰液素</td>
<td>小肠上部 S 细胞</td>
<td>HCl</td>
</tr>
<tr>
<td>CCK / 促胰酶素</td>
<td>小肠上部 I 细胞</td>
<td>蛋白质消化产物</td>
</tr>
</tbody></table>
<p>脂肪酸也可刺激促胰液素和 CCK。</p>
<h3>2｜总角色</h3>
<ul>
<li><strong>胃泌素</strong>：总体“兴奋胃”，尤其促 HCl；但幽门收缩更强，故总效应延缓胃排空。</li>
<li><strong>促胰液素</strong>：兴奋胰胆肠“水和 HCO₃⁻”，抑制胃酸和胃排空。</li>
<li><strong>CCK</strong>：兴奋胰酶和胆囊，抑制胃酸与胃排空。</li>
</ul>
<h3>3｜共同轴</h3>
<table>
<thead>
<tr>
<th>轴</th>
<th>胃泌素</th>
<th>促胰液素</th>
<th>CCK</th>
</tr>
</thead>
<tbody><tr>
<td>LES</td>
<td>收缩</td>
<td>舒张</td>
<td>舒张</td>
</tr>
<tr>
<td>胃酸</td>
<td>↑</td>
<td>↓</td>
<td>总效应↓</td>
</tr>
<tr>
<td>胃蛋白酶原</td>
<td>↑</td>
<td>↑</td>
<td>↑</td>
</tr>
<tr>
<td>胃运动</td>
<td>↑，但幽门收缩更强</td>
<td>↓</td>
<td>↓</td>
</tr>
<tr>
<td>胰液</td>
<td>胰酶↑</td>
<td>HCO₃⁻和水↑↑</td>
<td>胰酶↑↑</td>
</tr>
<tr>
<td>胆汁 / 胆囊</td>
<td>胆汁与胆囊有促进</td>
<td>胆管HCO₃⁻和水↑</td>
<td>胆囊收缩最强、Oddi舒张</td>
</tr>
<tr>
<td>营养作用</td>
<td>胃肠上皮</td>
<td>胰外分泌部</td>
<td>胰外分泌部</td>
</tr>
</tbody></table>
<p>（易混：问“加强胃运动和胆囊收缩”时，不能只凭“缩胆囊素”字面判断。CCK 强烈收缩胆囊，但抑制胃运动；胃泌素才促进胃运动。）</p>
<h3>4｜GIP 前馈接口</h3>
<p>食物中的葡萄糖、脂肪酸和氨基酸可促进 GIP 分泌；GIP 可在血糖明显升高前促进胰岛素，属于前馈接口。完整餐后—空腹调节归 D7。</p>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L480">当前完整知识与出处</a></p>
<h3>三种消化液缺失：先判断“哪类营养物最受影响”</h3>
<h3>1｜胃液缺乏</h3>
<ul>
<li>糖类消化：总体影响小；</li>
<li>蛋白质消化：有影响，但后续胰蛋白酶系统可承担主要消化；</li>
<li>脂肪消化：影响小；</li>
<li>B12 吸收：若伴内因子缺乏则显著受损；</li>
<li>HCl 缺乏还可降低促胰液素刺激和铁、钙溶解。</li>
</ul>
<h3>2｜胰液缺乏</h3>
<p>胰液是消化三大营养物质最强、最全面的消化液。</p>
<ul>
<li>蛋白质和脂肪消化明显受损；</li>
<li>糖类仍可由唾液淀粉酶、肠刷状缘酶等部分补偿，因此并非完全不能消化；</li>
<li>脂肪消化障碍最突出，可出现脂肪泻；</li>
<li>继发脂溶性维生素 A、D、E、K 吸收障碍。</li>
</ul>
<h3>3｜胆汁缺乏</h3>
<p>胆汁无消化酶，主要影响：</p>
<ul>
<li>脂肪乳化；</li>
<li>胰脂肪酶作用效率；</li>
<li>混合微胶粒形成；</li>
<li>脂类和 A、D、E、K 吸收。</li>
</ul>
<p>糖和蛋白质的酶解不以胆汁为必需。肝硬化等导致胆汁 / 胆盐供应不足时，首先受累的也是脂类消化吸收。</p>
<h3>定位原则</h3>
<pre><code class="language-text">脂肪泻 + ADEK缺乏
→ 优先考虑胰液不足或胆汁不足

三大营养物普遍消化差，尤以脂肪和蛋白明显
→ 胰腺外分泌问题更重
</code></pre>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L115">当前完整知识与出处</a></p>
<h3>从症状反推故障位置：中和、酶解、胆盐还是运动</h3>
<h3>1｜酸未被中和</h3>
<p>可能后果：</p>
<ul>
<li>十二指肠黏膜受酸刺激；</li>
<li>胰酶工作环境受损；</li>
<li>促胰液素轴和导管 HCO₃⁻分泌异常需被考虑。</li>
</ul>
<h3>2｜胰酶不足</h3>
<ul>
<li>蛋白和脂肪消化明显下降；</li>
<li>尤其脂肪泻和 ADEK 缺乏；</li>
<li>若胰蛋白酶不足，B12—R 蛋白复合物的后续处理也会受影响，D4再整合。</li>
</ul>
<h3>3｜胆盐不足</h3>
<ul>
<li>脂滴乳化下降；</li>
<li>混合微胶粒不足；</li>
<li>脂肪及脂溶性维生素吸收下降。</li>
</ul>
<h3>4｜运动异常</h3>
<ul>
<li>分节运动不足：混合和黏膜接触减少；</li>
<li>MMC 减弱：残渣和细菌清除下降；</li>
<li>蠕动过强 / 过弱：推进过快或潴留，均可影响消化吸收。</li>
</ul>
<h3>5｜交给 D4 的接口</h3>
<p>D3 只完成：</p>
<pre><code class="language-text">大分子 → 小分子 / 微胶粒
</code></pre>
<p>D4 继续回答：</p>
<pre><code class="language-text">小分子怎样跨顶端膜
→ 在上皮内如何加工
→ 经基底侧进入门静脉还是淋巴
</code></pre>
<hr>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_%E8%83%B0%E6%B6%B2%E8%83%86%E6%B1%81%E4%B8%8E%E5%B0%8F%E8%82%A0%E6%B6%88%E5%8C%96_%E5%A4%A7%E5%88%86%E5%AD%90%E6%8B%86%E8%A7%A3%E4%B8%8E%E8%84%82%E8%82%AA%E5%A4%84%E7%90%86_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md#L523">当前完整知识与出处</a></p>
</details>

</section>

<h2>由本模型继续</h2>
<p><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D4_%E5%B0%8F%E8%82%A0%E5%90%B8%E6%94%B6%E4%B8%8E%E8%90%A5%E5%85%BB%E8%BF%90%E8%BE%93_%E9%97%A8%E9%9D%99%E8%84%89%E6%B7%8B%E5%B7%B4%E4%B8%8E%E5%85%B3%E9%94%AE%E8%90%A5%E5%85%BB%E7%B4%A0_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md">跨上皮吸收</a>；<a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M6_%E8%83%86%E5%9B%BA%E9%86%87%E7%A3%B7%E8%84%82%E4%B8%8E%E8%83%86%E6%B1%81%E9%85%B8_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md">胆汁酸合成</a>；<a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/m-m1-m10/M10_%E8%A1%80%E7%BA%A2%E7%B4%A0%E8%83%86%E7%BA%A2%E7%B4%A0%E4%B8%8E%E7%94%9F%E7%89%A9%E8%BD%AC%E5%8C%96_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md">胆红素代谢</a>；<a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/%E6%B6%88%E5%8C%96%E7%B3%BB%E7%BB%9F_D19_%E8%83%86%E6%B1%81%E9%BB%84%E7%96%B8%E8%83%86%E7%9F%B3%E8%83%86%E9%81%93%E6%84%9F%E6%9F%93%E4%B8%8E%E8%82%9D%E8%84%93%E8%82%BF_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md">胆道疾病</a>；<a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/%E6%B6%88%E5%8C%96%E7%B3%BB%E7%BB%9F_D20_%E6%80%A5%E6%80%A7%E8%83%B0%E8%85%BA%E7%82%8E%E4%B8%8E%E8%83%B0%E8%85%BA%E8%82%BF%E7%98%A4_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md">胰腺炎临床及酶原争议接口</a>；<a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D7_%E8%BF%9B%E9%A3%9F%E7%A9%BA%E8%85%B9%E4%B8%8E%E8%83%B0%E5%B2%9B%E6%BF%80%E7%B4%A0_%E5%AD%A6%E4%B9%A0%E9%98%85%E8%AF%BB%E7%89%88_v1_%E6%9C%80%E7%BB%88%E6%89%A7%E8%A1%8C%E7%89%88.md">GIP前馈</a>。</p>
<p>原图仍按Current定位进入；本稿未检查原图像素，未制造Source接触、学习完成或记忆准入。</p>
<details class="support"><summary>展开Source、非KP保留项与逐项去向</summary>

<h3>Study 主范围</h3>
<ul>
<li>《生理学讲义》PDF P230–239｜书页 P202–210</li>
<li>《肠内消化》+《消化小结》</li>
</ul>
<p>保留项直接回到既有Current支持节点；本页医学/Source HOLD继续约束相关原文。Reference入口不等于已交付原生Memory答案。</p><ul><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L26">Study 主范围</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L35">Recall / Apply / Defer</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L41">Source boundary</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L76">2｜总 Framework</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L111">一句话恢复</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L576">3.1 腺泡 vs 导管</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L585">3.2 胰液 vs 胆汁</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L594">3.3 小肠 vs 大肠运动</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L604">3.4 胃、小肠、大肠运动归属</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L616">MI-G｜第一轮必须即时掌握</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L627">MI-D｜允许卡片化后置</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L640">5｜Study 原图门禁</a></li><li><a href="https://github.com/kianwang022-hash/kianos/blob/5be703d27ec319ec1786e05241ebb053ec38415a/content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D3_胰液胆汁与小肠消化_大分子拆解与脂肪处理_学习阅读版_v1_最终执行版.md#L687">7｜Lecture Knowledge Routing Ledger</a></li></ul><p>本地Memory提案尚未准入；原文中的历史门禁或关闭措辞不生成本次Source接触、评分或完成。</p>
<h3>当前原图定位（未检查）</h3>
<p>必须回看：</p>
<ol>
<li><strong>P230–233</strong>：胰腺腺泡 / 导管、胰酶原激活、促胰液素与 CCK 双控制。</li>
<li><strong>P233–235</strong>：胆汁形成、胆囊储存、Oddi 门控、胆盐肠肝循环。</li>
<li><strong>P234–235</strong>：脂滴乳化—辅脂酶—胰脂肪酶—混合微胶粒图。</li>
<li><strong>P235–236</strong>：小肠分节运动、大肠运动与集团蠕动。</li>
<li><strong>P237–238</strong>：三种胃肠激素总比较表和消化总图。</li>
</ol>
<p>闭卷门禁：能画“促胰液素 vs CCK”“酶原级联”“胆盐肠肝循环”三张最小图。</p>
<hr>
</details>
