import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bricolage_Grotesque } from "next/font/google";
import { Space_Mono } from "next/font/google";
import {
  DarkThemeInput,
  DarkThemeCheckbox,
  DarkThemeRadio,
  DarkThemeNumberInput,
  DarkThemeButton,
  DarkThemeQuestionCard,
  DarkThemeDivider,
  DarkThemeHeader
} from '@/components/FormComponents';

const fontHeading = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

function CreateQuizPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    quiz: '',
    adminUsername: '',
    adminPassword: '',
    activeUntil: '',
    questions: [
      {
        question: '',
        score: 1,
        bonus: false,
        options: Array(4).fill(null).map(() => ({ answer: '', isCorrect: false }))
      }
    ]
  });
  const [formErrors, setFormErrors] = useState({
    step1: {
      quiz: false,
      adminUsername: false,
      adminPassword: false,
      activeUntil: false
    },
    step2: {
      questions: []
    }
  });
  
  const [touchedFields, setTouchedFields] = useState({
    questions: []
  });

  useEffect(() => {
    if (touchedFields.questions.length !== formData.questions.length) {
      setTouchedFields(prev => ({
        ...prev,
        questions: Array(formData.questions.length).fill(null).map((_, i) => ({
          question: touchedFields.questions[i]?.question || false,
          options: Array(formData.questions[i].options.length).fill(false)
        }))
      }));
    }
  }, [formData.questions.length]);

  const validateStep1 = () => {
    const errors = {
      quiz: !formData.quiz,
      adminUsername: !formData.adminUsername,
      adminPassword: !formData.adminPassword,
      activeUntil: !formData.activeUntil
    };
    
    setFormErrors(prev => ({
      ...prev,
      step1: errors
    }));
    
    return !Object.values(errors).some(error => error);
  };

  const validateStep2 = () => {
    setTouchedFields({
      questions: formData.questions.map(q => ({
        question: true,
        options: Array(q.options.length).fill(true)
      }))
    });
    
    const questionErrors = formData.questions.map(q => {
      const questionError = !q.question;
      const optionErrors = q.options.map(opt => !opt.answer);
      return {
        question: questionError,
        options: optionErrors
      };
    });
    
    setFormErrors(prev => ({
      ...prev,
      step2: {
        questions: questionErrors
      }
    }));
    
    return !questionErrors.some(q => 
      q.question || q.options.some(optErr => optErr)
    );
  };

  const goToNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const addNewQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          score: 1,
          bonus: false,
          options: Array(4).fill(null).map(() => ({ answer: '', isCorrect: false }))
        }
      ]
    }));
    
    setTouchedFields(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: false,
          options: Array(4).fill(false)
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    
    setTouchedFields(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
    
    if (field === 'question') {
      setTouchedFields(prev => {
        const updatedTouched = [...prev.questions];
        if (updatedTouched[index]) {
          updatedTouched[index] = {
            ...updatedTouched[index],
            question: true
          };
        }
        return {
          ...prev,
          questions: updatedTouched
        };
      });
      
      setFormErrors(prev => {
        const updatedQuestionErrors = [...prev.step2.questions];
        if (updatedQuestionErrors[index]) {
          updatedQuestionErrors[index] = {
            ...updatedQuestionErrors[index],
            question: !value
          };
        }
        return {
          ...prev,
          step2: {
            ...prev.step2,
            questions: updatedQuestionErrors
          }
        };
      });
    }
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, qI) =>
        qI === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, oI) =>
                oI === optionIndex
                  ? { ...opt, [field]: value }
                  : field === 'isCorrect' && value === true
                  ? { ...opt, isCorrect: false }
                  : opt
              )
            }
          : q
      )
    }));
    
    if (field === 'answer') {
      setTouchedFields(prev => {
        const updatedTouched = [...prev.questions];
        if (updatedTouched[questionIndex] && updatedTouched[questionIndex].options) {
          const updatedOptions = [...updatedTouched[questionIndex].options];
          updatedOptions[optionIndex] = true;
          updatedTouched[questionIndex] = {
            ...updatedTouched[questionIndex],
            options: updatedOptions
          };
        }
        return {
          ...prev,
          questions: updatedTouched
        };
      });
      
      setFormErrors(prev => {
        const updatedQuestionErrors = [...prev.step2.questions];
        if (updatedQuestionErrors[questionIndex] && updatedQuestionErrors[questionIndex].options) {
          const updatedOptionErrors = [...updatedQuestionErrors[questionIndex].options];
          updatedOptionErrors[optionIndex] = !value;
          updatedQuestionErrors[questionIndex] = {
            ...updatedQuestionErrors[questionIndex],
            options: updatedOptionErrors
          };
        }
        return {
          ...prev,
          step2: {
            ...prev.step2,
            questions: updatedQuestionErrors
          }
        };
      });
    }
  };

  const formatDataForSubmission = () => {
    const totalScore = formData.questions.reduce((sum, q) => sum + q.score, 0);
    
    return {
      quiz: formData.quiz,
      username: formData.adminUsername,
      password: formData.adminPassword,
      active: true,
      totalScore,
      questions: formData.questions.map(q => ({
        question: q.question,
        score: q.score,
        bonus: q.bonus,
        options: q.options
      }))
    };
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    try {
        setIsSubmitting(true);
        setSubmitError(null);
        
        const dataToSubmit = formatDataForSubmission();
        
        const response = await fetch('/api/quizzes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save quiz');
        }
        
        setSubmitSuccess(true);
        
        const responseData = await response.json();
        const quizId = responseData.quizId; 
        
        setTimeout(() => {
            window.location.href = `/${quizId}/admin`;
        }, 2000);
        
    } catch (error) {
        setSubmitError(error.message);
        console.error('Error saving quiz:', error);
    } finally {
        setIsSubmitting(false);
    }
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    setFormErrors(prev => ({
      ...prev,
      step1: {
        ...prev.step1,
        [field]: !value
      }
    }));
  };

  const shouldShowError = (step, fieldType, questionIndex = null, optionIndex = null) => {
    if (step === 1) {
      return formErrors.step1[fieldType];
    } else if (step === 2) {
      if (fieldType === 'question') {
        return touchedFields.questions[questionIndex]?.question && 
               formErrors.step2.questions[questionIndex]?.question;
      } else if (fieldType === 'option') {
        return touchedFields.questions[questionIndex]?.options[optionIndex] && 
               formErrors.step2.questions[questionIndex]?.options[optionIndex];
      }
    }
    return false;
  };

  return (
    <div 
      className={`min-h-screen bg-[hsl(210,100%,6%)] text-[hsl(180,100%,90%)] 
      ${fontBody.variable} ${fontHeading.variable}`}
      style={{
        fontFamily: "var(--font-body)",
      }}
    >
      {}
      <div className="flex justify-between items-center py-4 px-8">
        <button
          className="text-[hsl(180,100%,90%)] text-4xl transition-colors"
          onClick={() => window.location.href = '/'}
        >
          Noodl.
        </button>
        <img
          src="/ramen.png"
          alt="Logo"
          className="w-16 h-16"
        />
      </div>

      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="bg-[hsl(210,100%,12%)] rounded-lg shadow-lg px-8 py-8">
          <DarkThemeHeader 
            title="Create New Quiz" 
            subtitle={`Step ${step} of 2: ${step === 1 ? 'Basic Information' : 'Questions'}`}
          />

          {}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-300">
              Quiz successfully created! Redirecting...
            </div>
          )}
          
          {}
          {submitError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
              Error: {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {}
                  <div>
                    <DarkThemeInput 
                      label={<>Quiz Name <span className="text-red-400">*</span></>}
                      name="quiz-name"
                      value={formData.quiz}
                      onChange={e => handleInputChange('quiz', e.target.value)}
                      placeholder="Enter quiz name"
                      className={formErrors.step1.quiz ? "border-red-500" : ""}
                    />
                    {formErrors.step1.quiz && (
                      <p className="mt-1 text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> Required
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <DarkThemeInput 
                      label={<>Admin Username <span className="text-red-400">*</span></>}
                      name="admin-username"
                      value={formData.adminUsername}
                      onChange={e => handleInputChange('adminUsername', e.target.value)}
                      placeholder="Enter admin username"
                      className={formErrors.step1.adminUsername ? "border-red-500" : ""}
                    />
                    {formErrors.step1.adminUsername && (
                      <p className="mt-1 text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> Required
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <DarkThemeInput 
                      label={<>Admin Password <span className="text-red-400">*</span></>}
                      name="admin-password"
                      type="password"
                      value={formData.adminPassword}
                      onChange={e => handleInputChange('adminPassword', e.target.value)}
                      placeholder="Enter admin password"
                      className={formErrors.step1.adminPassword ? "border-red-500" : ""}
                    />
                    {formErrors.step1.adminPassword && (
                      <p className="mt-1 text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> Required
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <DarkThemeInput 
                      label={<>Active Until <span className="text-red-400">*</span></>}
                      name="active-until"
                      type="datetime-local"
                      value={formData.activeUntil}
                      onChange={e => handleInputChange('activeUntil', e.target.value)}
                      helpText="Quiz will be accessible until this date and time"
                      className={formErrors.step1.activeUntil ? "border-red-500" : ""}
                    />
                    {formErrors.step1.activeUntil && (
                      <p className="mt-1 text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> Required
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >

                {}
                {formData.questions.map((question, index) => (
                <DarkThemeQuestionCard key={index}>
                    <div className="flex justify-between">
                    <div className="flex-1 pr-4">
                        <label className="block text-[hsl(180,100%,90%)] text-sm font-medium mb-2">
                        Question {index + 1} <span className="text-red-400">*</span>
                        </label>
                        <input
                        type="text"
                        className={`w-full rounded-lg border ${
                          shouldShowError(2, 'question', index)
                            ? "border-red-500" 
                            : "border-[hsl(180,100%,90%)]/20"
                        } bg-[hsl(210,100%,18%)] 
                        text-[hsl(180,100%,90%)] py-2.5 px-4 shadow-sm transition-all duration-200
                        focus:border-[hsl(180,100%,80%)] focus:outline-none focus:ring-2 focus:ring-[hsl(180,100%,80%)]/30
                        focus:shadow-md placeholder-[hsl(180,100%,90%)]/40`}
                        value={question.question}
                        onChange={e => updateQuestion(index, 'question', e.target.value)}
                        placeholder="Enter your question"
                        />
                        {shouldShowError(2, 'question', index) && (
                          <p className="mt-1 text-red-400 text-sm flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> Required
                          </p>
                        )}
                    </div>
                    {formData.questions.length > 1 && (
                        <button 
                        type="button"
                        onClick={() => removeQuestion(index)} 
                        className="text-[hsl(0,100%,70%)] hover:text-[hsl(0,100%,80%)] self-start mt-2 p-1.5 rounded-full
                        hover:bg-[hsl(0,100%,90%)]/10 transition-colors duration-200"
                        >
                        <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    </div>

                    {}
                    <div className="flex items-center space-x-6 mt-4">
                    <DarkThemeNumberInput 
                        label="Score:"
                        name={`score-${index}`}
                        value={question.score}
                        onChange={e => updateQuestion(index, 'score', parseInt(e.target.value) || 1)}
                        min="1"
                        max="10"
                    />
                    <DarkThemeCheckbox 
                        label="Bonus Question"
                        id={`bonus-${index}`}
                        checked={question.bonus}
                        onChange={e => updateQuestion(index, 'bonus', e.target.checked)}
                    />
                    </div>

                    <div className="space-y-3 mt-5">
                    <div className="flex justify-between text-[hsl(180,100%,90%)] mb-3 border-b border-[hsl(180,100%,90%)]/15 pb-2">
                        <span className="text-sm font-medium">Answer Options <span className="text-red-400">*</span></span>
                        <span className="text-sm font-medium pr-4">Correct</span>
                    </div>
                    {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                              type="text"
                              className={`w-full rounded-lg border ${
                                shouldShowError(2, 'option', index, optIndex)
                                  ? "border-red-500" 
                                  : "border-[hsl(180,100%,90%)]/20"
                              } bg-[hsl(210,100%,18%)] 
                              text-[hsl(180,100%,90%)] py-2 px-4 shadow-sm transition-all duration-200
                              focus:border-[hsl(180,100%,80%)] focus:outline-none focus:ring-2 focus:ring-[hsl(180,100%,80%)]/30
                              focus:shadow-md placeholder-[hsl(180,100%,90%)]/40`}
                              value={option.answer}
                              onChange={e => updateOption(index, optIndex, 'answer', e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                          />
                          {shouldShowError(2, 'option', index, optIndex) && (
                            <p className="mt-1 text-red-400 text-sm flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" /> Required
                            </p>
                          )}
                        </div>
                        <DarkThemeRadio 
                            name={`correct-${index}`}
                            value={optIndex}
                            checked={option.isCorrect}
                            onChange={() => updateOption(index, optIndex, 'isCorrect', true)}
                            ariaLabel={`Mark option ${optIndex + 1} as correct`}
                        />
                        </div>
                    ))}
                    </div>
                </DarkThemeQuestionCard>
                ))}

                {}
                <div className="flex justify-center py-6">
                <DarkThemeButton onClick={addNewQuestion} variant="primary" className="shadow-lg">
                    <Plus className="w-5 h-5 mr-2" /> Add Question
                </DarkThemeButton>
                </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DarkThemeDivider />

            {}
            <div className="mt-6 flex justify-between pt-10"> 
              {step !== 1 && (
                <DarkThemeButton
                  variant="secondary"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Previous
                </DarkThemeButton>
              )}

              {step === 1 ? (
                <DarkThemeButton 
                  variant="primary" 
                  onClick={goToNextStep}
                  className="ml-auto"
                >
                  Next <ChevronRight className="w-5 h-5 ml-1" />
                </DarkThemeButton>
              ) : (
                <DarkThemeButton 
                  type="submit" 
                  variant="success"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" /> Save Quiz
                    </>
                  )}
                </DarkThemeButton>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateQuizPage;