import { z } from 'zod';
import { QuestionType } from './questions'; // Seu enum

// --- PASSO 1: Defina os schemas para o que está DENTRO do 'data' ---

const MultipleChoiceDataSchema = z.object({
  statement: z.string().min(1, "O statement é obrigatório"),
  options: z.array(z.object({
    label: z.string().min(1, "O label da opção é obrigatório"),
    is_correct: z.boolean(),
  })).min(1, "A questão deve ter pelo menos uma opção"),
});

const MatchingPairsDataSchema = z.object({
  statement: z.string().min(1, "O statement é obrigatório"),
  pairs: z.array(z.object({
    label: z.string().min(1, "O 'label' do par é obrigatório"),
    answer: z.string().min(1, "O 'answer' do par é obrigatório"),
  })).min(1, "A questão deve ter pelo menos um par"),
});
  
const FillInTheBlankDataSchema = z.object({
  statement: z.string().min(1, "O enunciado da questão é obrigatório"),
  correct_answers: z.array(z.string().min(1, "A resposta correta não pode ser vazia")).min(1, "Deve haver pelo menos uma resposta correta"),
  wrong_answers: z.array(z.string().min(1, "A resposta incorreta não pode ser vazia")),
});

// --- PASSO 2: Crie os "Schemas Variantes" ---
// Cada um combina o 'type' com o 'data' correspondente.

const MultipleChoiceSchema = z.object({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  data: MultipleChoiceDataSchema,
});

const MatchingPairsSchema = z.object({
  type: z.literal(QuestionType.MATCHING_PAIRS),
  data: MatchingPairsDataSchema,
});

const FillInTheBlankSchema = z.object({
  type: z.literal(QuestionType.FILL_IN_THE_BLANK),
  data: FillInTheBlankDataSchema,
});

// --- PASSO 3: Crie o Schema Base ---
// O que é comum a TODAS as questões.

const BaseQuestionSchema = z.object({
  class_id: z.coerce.number().int().positive("O class_id é obrigatório"),
});

// --- PASSO 4: Combine tudo (A Mágica) ---

// 'discriminatedUnion' olha o 'type' e escolhe o schema certo
const QuestionVariantSchema = z.discriminatedUnion('type', [
  MultipleChoiceSchema,
  MatchingPairsSchema,
  FillInTheBlankSchema,
]);

// Combine o Base (class_id) com as Variantes (type + data)
export const CreateQuestionSchema = BaseQuestionSchema.and(QuestionVariantSchema);

// (Opcional) Crie um tipo TypeScript a partir do schema
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;