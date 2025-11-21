import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrushCleaning } from 'lucide-react';

interface Pair {
  label: string;
  answer: string;
}

interface ColumnItem {
  id: string;
  content: string;
  matchId: string;
}

interface QuestionMatchingPairsProps {
  data: {
    statement: string;
    pairs: Pair[];
  };
  showResults: boolean;
  onValidationComplete: (selected: boolean, answer?: any) => void;
  onAllSelectedChange: (selected: boolean, answer?: any) => void;
}

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function QuestionMatchingPairs({ data, showResults, onValidationComplete, onAllSelectedChange }: QuestionMatchingPairsProps) {
  const { leftColumnItems, rightColumnItems, correctPairsMap } = useMemo(() => {
    const leftItems = data.pairs.map((p, i) => ({ id: `l${i}`, content: p.label, matchId: `m${i}` }));
    const rightItems = data.pairs.map((p, i) => ({ id: `r${i}`, content: p.answer, matchId: `m${i}` }));
    const correctPairs = new Map(data.pairs.map((p, i) => [`l${i}`, `r${i}`]));
    return {
      leftColumnItems: leftItems,
      rightColumnItems: shuffleArray(rightItems),
      correctPairsMap: correctPairs,
    };
  }, [data.pairs]);

  const [selectedLeft, setSelectedLeft] = useState<ColumnItem | null>(null);
  const [tempSelectedRight, setTempSelectedRight] = useState<ColumnItem | null>(null);
  const [userPairs, setUserPairs] = useState<Record<string, string>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect'>>({});

  useEffect(() => {
    if (showResults) {
      const newValidationStatus: Record<string, 'correct' | 'incorrect'> = {};
      let allCorrect = true;

      if (Object.keys(userPairs).length !== leftColumnItems.length) {
        allCorrect = false;
      }

      for (const leftId in userPairs) {
        const rightId = userPairs[leftId];
        const leftItem = leftColumnItems.find(item => item.id === leftId);
        const rightItem = rightColumnItems.find(item => item.id === rightId);

        if (leftItem && rightItem) {
          const areCorrect = leftItem.matchId === rightItem.matchId;
          if (!areCorrect) {
            allCorrect = false;
          }
          newValidationStatus[leftId] = areCorrect ? 'correct' : 'incorrect';
          newValidationStatus[rightId] = areCorrect ? 'correct' : 'incorrect';
        } else {
          allCorrect = false;
        }
      }
      setValidationStatus(newValidationStatus);
      onValidationComplete(allCorrect);
    }
  }, [showResults, userPairs, leftColumnItems, rightColumnItems]);

  useEffect(() => {
    const allPairsMade = Object.keys(userPairs).length === leftColumnItems.length;
    const formattedPairs = Object.entries(userPairs).map(([leftId, rightId]) => {
        const leftItem = leftColumnItems.find(item => item.id === leftId);
        const rightItem = rightColumnItems.find(item => item.id === rightId);
        return { prompt: leftItem?.content || '', answer: rightItem?.content || '' };
    });
    onAllSelectedChange(allPairsMade, formattedPairs);
  }, [userPairs, leftColumnItems, rightColumnItems]);


  const handleSelect = (item: ColumnItem, column: 'left' | 'right') => {
    if (showResults || tempSelectedRight) return;

    if (column === 'left') {
      if (userPairs[item.id]) return;
      setSelectedLeft(item);
    } else if (selectedLeft) {
      const leftId = selectedLeft.id;
      const rightId = item.id;

      if (Object.values(userPairs).includes(rightId)) return;

      setTempSelectedRight(item);

      setTimeout(() => {
        setUserPairs(prev => ({ ...prev, [leftId]: rightId }));
        setSelectedLeft(null);
        setTempSelectedRight(null);
      }, 500);
    }
  };

  const getItemClass = (item: ColumnItem) => {
    const isLeftSelected = selectedLeft?.id === item.id;
    const isRightTempSelected = tempSelectedRight?.id === item.id;
    const isPaired = userPairs[item.id] || Object.values(userPairs).includes(item.id);
    const status = validationStatus[item.id];

    return cn(
      'p-4 border rounded-md transition-colors h-full flex items-center justify-center text-center',
      {
        'cursor-pointer hover:bg-[#F7F7F7] dark:hover:bg-[#3C3C3C]': !isPaired && !showResults,
        'border-blue-base': isLeftSelected || isRightTempSelected,
        'opacity-50 cursor-not-allowed': isPaired && !showResults,
        'border-purple-predominant': showResults && status === 'correct',
        'border-red-500': showResults && status === 'incorrect',
      }
    );
  };

  const handleReset = () => {
    setSelectedLeft(null);
    setTempSelectedRight(null);
    setUserPairs({});
    setValidationStatus({});
  };

  return (
    <div className="mt-24 w-full max-w-2xl mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <small className="text-base text-[#AFAFAF]">* Combine os Pares</small>
        
        {showResults ? (
            <Button variant="outline" onClick={handleReset} disabled>
                <BrushCleaning className="mr-2" /> Limpar
            </Button>
        ) : (
            <Button variant="outline" onClick={handleReset}>
                <BrushCleaning className="mr-2" /> Limpar
            </Button>
        )}
      </div>
      <p className="text-base mt-4 mb-4">{data.statement}</p>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-4">
            {leftColumnItems.map((leftItem) => (
                <div
                    key={leftItem.id}
                    className={getItemClass(leftItem)}
                    onClick={() => handleSelect(leftItem, 'left')}
                >
                    {leftItem.content}
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
            {rightColumnItems.map((rightItem) => (
                <div
                    key={rightItem.id}
                    className={getItemClass(rightItem)}
                    onClick={() => handleSelect(rightItem, 'right')}
                >
                    {rightItem.content}
                </div>
            ))}
        </div>
    </div>
    </div>
  );
}
