export interface DemoAnimation {
  title: string
  summary: string
  keyPoints: string[]
  videoUrl: string
}

interface DemoAnimationEntry extends DemoAnimation {
  keywords: readonly string[]
}

export const STATIC_DEMO_PROMPTS = [
  '2x2 matrices',
  'matrix addition',
  'scalar multiplication',
] as const

const DEMO_ANIMATIONS: readonly DemoAnimationEntry[] = [
  {
    title: 'Introduction to 2x2 matrices',
    summary: 'A 2x2 matrix is introduced, showing its rows, columns, and the matrix as a whole.',
    keyPoints: [
      'Introduction to 2x2 matrices',
      'Identifying rows and columns',
      'Matrix as a single unit',
    ],
    videoUrl: '/demo-media/matrix-intro.mp4',
    keywords: [
      'matrix',
      'matrices',
      '2x2',
      '2 x 2',
      'rows',
      'columns',
      'grid',
      'matrix theory',
      'linear algebra',
      'eigenvalue',
      'eigenvalues',
      'determinant',
      'determinants',
      'eigenvector',
      'eigenvectors',
    ],
  },
  {
    title: 'Matrix addition',
    summary: 'Learn how to add matrices by adding corresponding elements. Matrices must have the same dimensions.',
    keyPoints: [
      'Add elements in the same position',
      'Matrices must have identical dimensions',
      'The result keeps the same shape',
    ],
    videoUrl: '/demo-media/matrix-addition.mp4',
    keywords: ['matrix addition', 'add matrix', 'add matrices', 'corresponding', 'sum', 'plus'],
  },
  {
    title: 'Scalar multiplication',
    summary: 'Multiplying a vector by a scalar changes its length and/or direction. Positive scalars stretch or shrink it, while negative scalars reverse its direction.',
    keyPoints: [
      'Scalar multiplication changes vector magnitude',
      'Negative scalars reverse direction',
      'Scaling can stretch or shrink a vector',
    ],
    videoUrl: '/demo-media/scalar-multiplication.mp4',
    keywords: ['scalar', 'vector', 'scale', 'scaled', 'magnitude', 'direction', 'stretch', 'shrink'],
  },
]

function normalizeText(input: string) {
  return input.trim().toLowerCase()
}

export function selectDemoAnimation(input: string, index = 0): DemoAnimation | null {
  const text = normalizeText(input)

  const exactMatches = DEMO_ANIMATIONS.filter((entry) =>
    entry.keywords.some((keyword) => text.includes(keyword)),
  )

  if (exactMatches.length > 0) {
    return exactMatches[index % exactMatches.length]
  }

  return null
}
