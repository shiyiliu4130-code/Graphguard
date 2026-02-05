
import React, { useState, useEffect, useRef } from 'react';
import { FeatureStepInfo } from '../types';

const RiskAnalysisWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [featureProgress, setFeatureProgress] = useState(0);
  const [isProcessingFeatures, setIsProcessingFeatures] = useState(false);
  const [currentProcessStep, setCurrentProcessStep] = useState(-1);
  const [selectedModel, setSelectedModel] = useState('');
  const [isModelRunning, setIsModelRunning] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [isRecognitionCompleted, setIsRecognitionCompleted] = useState(false);
  const d3Container = useRef<HTMLDivElement>(null);

  const stepInfo: FeatureStepInfo[] = [
    { title: "正在执行: 数据清洗", desc: "处理数据中的缺失值、异常值和重复值", features: [0] },
    { title: "正在执行: 特征提取", desc: "从原始数据中提取基本信息、行为特征", features: [1] },
    { title: "正在执行: 特征转换", desc: "对分类特征进行编码，数值特征标准化", features: [0, 1] },
    { title: "正在执行: 特征选择", desc: "选择最有效的特征子集", features: [2] },
    { title: "正在执行: 特征生成", desc: "生成交叉特征和衍生特征", features: [3] }
  ];

  const featureItems = [
    { title: "数据清洗与预处理", desc: "缺失值、异常值检测、数据标准化" },
    { title: "基础特征提取", desc: "用户基本信息、历史行为、设备指纹" },
    { title: "图结构特征构建", desc: "社交网络、节点中心性、聚类系数" },
    { title: "时序特征生成", desc: "基于时间序列的行为模式分析" }
  ];

  // Feature Engineering Simulation
  const startFeatureEngineering = () => {
    setIsProcessingFeatures(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      if (prog > 100) prog = 100;
      setFeatureProgress(prog);
      setCurrentProcessStep(Math.min(Math.floor(prog / 20.1), 4));

      if (prog >= 100) {
        clearInterval(interval);
      }
    }, 150);
  };

  // Model Running Simulation
  const runModel = () => {
    if (!selectedModel) {
      alert('请先选择算法模型');
      return;
    }
    setIsModelRunning(true);
    setRiskResult(null);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setIsModelRunning(false);
        setRiskResult({
          level: '中等风险',
          id: 'U20260315007',
          confidence: (Math.random() * 10 + 85).toFixed(1) + '%',
          time: new Date().toLocaleString(),
          desc: '该用户存在一定的欺诈风险特征，建议进一步人工审核。'
        });
      }
      setModelProgress(prog);
    }, 300);
  };

  // D3 Knowledge Graph (Step 3)
  useEffect(() => {
    if (currentStep === 3 && d3Container.current) {
      const container = d3Container.current;
      container.innerHTML = '';
      const width = container.clientWidth;
      const height = container.clientHeight || 500;

      const svg = (window as any).d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height);

      const nodes = [
        { id: "user", name: "评估用户", type: "user", risk: "中等", group: 0 },
        { id: "basic", name: "基本信息", type: "feature", group: 1 },
        { id: "behavior", name: "行为特征", type: "feature", group: 1 },
        { id: "social", name: "社交特征", type: "feature", group: 1 },
        { id: "contact1", name: "联系人A", type: "contact", group: 2 },
        { id: "device", name: "设备指纹", type: "device", group: 2 },
        { id: "risk1", name: "异常登录", type: "risk", group: 3 }
      ];

      const links = [
        { source: "user", target: "basic" },
        { source: "user", target: "behavior" },
        { source: "user", target: "social" },
        { source: "user", target: "contact1" },
        { source: "user", target: "device" },
        { source: "behavior", target: "risk1" }
      ];

      const simulation = (window as any).d3.forceSimulation(nodes)
        .force("link", (window as any).d3.forceLink(links).id((d:any) => d.id).distance(120))
        .force("charge", (window as any).d3.forceManyBody().strength(-400))
        .force("center", (window as any).d3.forceCenter(width / 2, height / 2));

      const link = svg.append("g").selectAll("line")
        .data(links).enter().append("line")
        .attr("stroke", "#aaa").attr("stroke-opacity", 0.6).attr("stroke-width", 2);

      const node = svg.append("g").selectAll("g")
        .data(nodes).enter().append("g")
        .call((window as any).d3.drag()
          .on("start", (e:any, d:any) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (e:any, d:any) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e:any, d:any) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

      node.append("circle")
        .attr("r", (d:any) => d.type === "user" ? 35 : 25)
        .attr("fill", (d:any) => d.type === "user" ? "#4dabf7" : d.type === "feature" ? "#52c41a" : d.type === "risk" ? "#f5222d" : "#fa8c16")
        .attr("stroke", "#fff").attr("stroke-width", 2);

      node.append("text").text((d:any) => d.name).attr("text-anchor", "middle").attr("dy", 45).attr("font-size", "12px").attr("fill", "#333");

      simulation.on("tick", () => {
        link.attr("x1", (d:any) => d.source.x).attr("y1", (d:any) => d.source.y).attr("x2", (d:any) => d.target.x).attr("y2", (d:any) => d.target.y);
        node.attr("transform", (d:any) => `translate(${d.x}, ${d.y})`);
      });
    }
  }, [currentStep]);

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4dabf7] to-[#1890ff] p-6 rounded-xl text-white shadow-lg">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <i className="fas fa-shield-alt mr-4"></i> 风险识别研判系统
        </h1>
        <p className="opacity-90">GraphGuard——基于图深度学习的银行信贷智能反欺诈风险识别与研判系统</p>
      </div>

      {/* Steps Indicator */}
      <div className="flex bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {[1, 2, 3].map((step) => (
          <div key={step} className={`flex-1 flex items-center relative ${step < 3 ? 'after:content-[""] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-3/5 after:h-[2px] after:bg-gray-100' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 z-10 ${currentStep === step ? 'bg-[#4dabf7] text-white' : currentStep > step ? 'bg-[#52c41a] text-white' : 'bg-gray-100 text-gray-400'}`}>
              {currentStep > step ? '✓' : step}
            </div>
            <div>
              <div className="font-bold text-gray-800">{step === 1 ? '特征工程' : step === 2 ? '模型研判' : '反欺诈识别'}</div>
              <div className="text-xs text-gray-400">{step === 1 ? '数据预处理' : step === 2 ? '算法风险评估' : '图谱展示'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px]">
        {currentStep === 1 && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-[#0d2b5c] pb-4 border-bottom border-gray-100">特征工程处理</h2>
            <p className="text-gray-600">系统将原始信贷数据转换为可用于模型训练的特征。点击按钮启动流程。</p>
            
            <div className="flex justify-between relative mb-12">
              {[1, 2, 3, 4, 5].map((s, idx) => (
                <div key={s} className="flex flex-col items-center w-1/5 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm mb-2 ${currentProcessStep >= idx ? 'bg-[#52c41a] text-white' : currentProcessStep === idx - 1 ? 'bg-[#4dabf7] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {currentProcessStep >= idx ? '✓' : s}
                  </div>
                  <div className="text-sm font-bold">{['数据清洗', '特征提取', '特征转换', '特征选择', '特征生成'][idx]}</div>
                </div>
              ))}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 z-0"></div>
            </div>

            <div className="text-center">
              <button 
                onClick={startFeatureEngineering}
                disabled={isProcessingFeatures}
                className={`px-8 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center mx-auto ${featureProgress === 100 ? 'bg-[#52c41a] text-white border-2 border-white' : 'bg-gradient-to-r from-[#36F1CD] to-[#165DFF] text-white hover:scale-105'}`}
              >
                {featureProgress === 100 ? (
                  <><i className="fas fa-check-circle mr-2"></i> 特征工程已完成</>
                ) : (
                  <><i className={`fas ${isProcessingFeatures ? 'fa-spinner fa-spin' : 'fa-play-circle'} mr-2`}></i> {isProcessingFeatures ? '特征处理中...' : '开始特征工程处理'}</>
                )}
              </button>
            </div>

            {isProcessingFeatures && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="bg-[#f0f8ff] p-4 rounded-lg border-l-4 border-[#4dabf7]">
                  <div className="font-bold text-[#0d2b5c]">{stepInfo[currentProcessStep]?.title}</div>
                  <div className="text-sm text-gray-600">{stepInfo[currentProcessStep]?.desc}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-[#4dabf7]">
                    <span>处理进度</span>
                    <span>{featureProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4dabf7] to-[#1890ff] transition-all duration-300" style={{ width: `${featureProgress}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {featureProgress > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                {featureItems.map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-lg border transition-all ${featureProgress > (idx + 1) * 20 ? 'bg-[#f6ffed] border-[#b7eb8f]' : isProcessingFeatures && currentProcessStep >= idx ? 'bg-[#fffbe6] border-[#ffe58f]' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">{item.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${featureProgress > (idx + 1) * 20 ? 'bg-green-100 text-green-600' : isProcessingFeatures && currentProcessStep >= idx ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                        {featureProgress > (idx + 1) * 20 ? '已完成' : isProcessingFeatures && currentProcessStep >= idx ? '处理中' : '等待中'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-8">
              <button 
                onClick={() => setCurrentStep(2)}
                disabled={featureProgress < 100}
                className="btn btn-primary px-8 py-3 rounded-lg font-bold bg-[#165DFF] text-white disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-[#0d2b5c] transition-all"
              >
                下一步：模型研判 <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-[#0d2b5c]">模型研判分析</h2>
            <div className="grid grid-cols-3 gap-6">
              {['GraphSAGE', 'GAT2', 'GSA'].map((model) => (
                <div 
                  key={model}
                  onClick={() => !isModelRunning && setSelectedModel(model)}
                  className={`p-6 rounded-xl border-2 text-center cursor-pointer transition-all hover:-translate-y-1 ${selectedModel === model ? 'border-[#4dabf7] bg-[#f0f8ff]' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="text-4xl text-[#4dabf7] mb-4">
                    <i className={`fas ${model === 'GraphSAGE' ? 'fa-project-diagram' : model === 'GAT2' ? 'fa-brain' : 'fa-link'}`}></i>
                  </div>
                  <div className="font-bold text-lg mb-2">{model}</div>
                  <div className="text-xs text-gray-500">
                    {model === 'GraphSAGE' ? '基于采样的图神经网络，捕捉局部特征。' : model === 'GAT2' ? '图注意力网络，捕捉节点重要关系。' : '结合结构信息与注意力机制。'}
                  </div>
                </div>
              ))}
            </div>

            {isModelRunning && (
              <div className="bg-[#f0f8ff] p-8 rounded-xl text-center space-y-4">
                <div className="text-4xl text-[#4dabf7] animate-spin"><i className="fas fa-cog"></i></div>
                <div className="font-bold text-xl">模型研判中...</div>
                <div className="text-gray-500">正在使用 {selectedModel} 模型进行风险评估</div>
                <div className="w-full h-2 bg-gray-200 rounded-full max-w-md mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#4dabf7] to-[#1890ff] transition-all" style={{ width: `${modelProgress}%` }}></div>
                </div>
              </div>
            )}

            {riskResult && (
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 animate-fadeIn">
                <h3 className="font-bold text-lg mb-6">风险评估结果</h3>
                <div className="inline-block px-8 py-3 rounded-full text-2xl font-black bg-[#fff7e6] text-[#fa8c16] border-2 border-[#ffd591] mb-6">
                  {riskResult.level}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>用户ID: <span className="font-bold text-gray-800">{riskResult.id}</span></div>
                  <div>所选模型: <span className="font-bold text-gray-800">{selectedModel}</span></div>
                  <div>研判时间: <span className="font-bold text-gray-800">{riskResult.time}</span></div>
                  <div>置信度: <span className="font-bold text-gray-800 text-[#52c41a]">{riskResult.confidence}</span></div>
                  <div className="col-span-2 mt-2">{riskResult.desc}</div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-8">
              <button onClick={() => setCurrentStep(1)} className="px-8 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-50"><i className="fas fa-arrow-left mr-2"></i> 返回特征工程</button>
              <div className="space-x-4">
                <button onClick={runModel} disabled={isModelRunning} className="px-8 py-3 rounded-lg font-bold border border-[#4dabf7] text-[#4dabf7] hover:bg-[#f0f8ff] disabled:opacity-50"><i className="fas fa-play-circle mr-2"></i> 运行模型研判</button>
                <button onClick={() => setCurrentStep(3)} disabled={!riskResult} className="px-8 py-3 rounded-lg font-bold bg-[#165DFF] text-white hover:bg-[#0d2b5c] disabled:bg-gray-200">下一步：反欺诈识别</button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-[#0d2b5c]">反欺诈知识图谱</h2>
            <p className="text-gray-500 text-sm">中心节点为当前评估用户，外围展示特征关联、行为路径及潜在风险触点。</p>
            
            <div ref={d3Container} className="w-full h-[500px] border border-gray-100 rounded-xl bg-[#fafafa] relative overflow-hidden"></div>
            
            <div className="bg-[#f0f8ff] p-6 rounded-xl border-l-4 border-[#4dabf7] text-sm space-y-2">
              <div className="font-bold text-[#0d2b5c]">图谱说明</div>
              <p>1. <span className="text-[#4dabf7] font-bold">蓝色节点</span>：评估用户主体。</p>
              <p>2. <span className="text-[#52c41a] font-bold">绿色节点</span>：各类合规特征（基础、行为、时序）。</p>
              <p>3. <span className="text-[#fa8c16] font-bold">橙色节点</span>：外部关联实体（设备、联系人）。</p>
              <p>4. <span className="text-[#f5222d] font-bold">红色节点</span>：检测到的异常风险项。</p>
            </div>

            {isRecognitionCompleted && (
              <div className="bg-[#f6ffed] p-8 rounded-xl border border-[#b7eb8f] text-center space-y-3 animate-fadeIn">
                <div className="text-5xl text-[#52c41a]"><i className="fas fa-check-circle"></i></div>
                <div className="text-xl font-bold text-[#52c41a]">风险识别完成！</div>
                <div className="text-gray-600">评估结果已存档至数据库，风控策略已同步更新。</div>
                <div className="font-bold">最终风险等级: <span className="text-[#fa8c16]">中等风险</span></div>
              </div>
            )}

            <div className="flex justify-between pt-8">
              <button onClick={() => setCurrentStep(2)} className="px-8 py-3 rounded-lg font-bold border border-gray-200 hover:bg-gray-50"><i className="fas fa-arrow-left mr-2"></i> 返回模型研判</button>
              <button 
                onClick={() => {
                  setIsRecognitionCompleted(true);
                  alert(`识别完成！\n风险等级：中等风险\n模型：${selectedModel}`);
                }} 
                disabled={isRecognitionCompleted}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${isRecognitionCompleted ? 'bg-[#52c41a]' : 'bg-[#165DFF] hover:bg-[#0d2b5c]'}`}
              >
                {isRecognitionCompleted ? '✓ 已完成识别' : '完成识别'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysisWizard;
