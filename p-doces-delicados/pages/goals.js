// pages/goals.js (CORRIGIDO - COM CARREGAMENTO CORRETO DE MASSA E COBERTURA)
import Layout from '../components/Layout/Layout'
import GlassCard from '../components/UI/GlassCard'
import GlassButton from '../components/UI/GlassButton'
import { useState, useEffect } from 'react'
import {
    FaBullseye,
    FaCalculator,
    FaCalendar,
    FaChartLine,
    FaCookie,
    FaBirthdayCake,
    FaDollarSign,
    FaShoppingCart,
    FaClock,
    FaTools,
    FaIndustry,
    FaExclamationTriangle,
    FaSync
} from 'react-icons/fa'

export default function Goals() {
    const [candies, setCandies] = useState([])
    const [cakes, setCakes] = useState([])
    const [cakeMasses, setCakeMasses] = useState([])
    const [cakeFrostings, setCakeFrostings] = useState([])
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [goalData, setGoalData] = useState({
        firstGoal: '',
        secondGoal: '',
        workingDays: 22,
        dailyHours: 8
    })
    const [calculation, setCalculation] = useState(null)
    const [costPerMinute, setCostPerMinute] = useState(0)
    const [loading, setLoading] = useState(true)
    const [debugInfo, setDebugInfo] = useState('')

    useEffect(() => {
        loadAllData()
    }, [])

    const loadAllData = async () => {
        try {
            setLoading(true)
            console.log('🔄 Carregando dados para Goals...')

            // CORREÇÃO: Carregar TODOS os dados necessários
            const [
                candiesRes,
                cakesRes,
                cakeMassesRes,
                cakeFrostingsRes,
                productsRes,
                fixedCostsRes,
                docinhoMassesRes // Adicionar massas de docinhos também
            ] = await Promise.all([
                fetch('/api/candies'),
                fetch('/api/cakes'),
                fetch('/api/cake-masses'),       // Massas de bolos
                fetch('/api/cake-frostings'),    // Coberturas de bolos
                fetch('/api/products'),
                fetch('/api/fixed-costs'),
                fetch('/api/masses')             // Massas de docinhos
            ])

            const candiesData = candiesRes.ok ? await candiesRes.json() : []
            const cakesData = cakesRes.ok ? await cakesRes.json() : []
            const cakeMassesData = cakeMassesRes.ok ? await cakeMassesRes.json() : []
            const cakeFrostingsData = cakeFrostingsRes.ok ? await cakeFrostingsRes.json() : []
            const productsData = productsRes.ok ? await productsRes.json() : []
            const fixedCostsData = fixedCostsRes.ok ? await fixedCostsRes.json() : []
            const docinhoMassesData = docinhoMassesRes.ok ? await docinhoMassesRes.json() : []

            // CORREÇÃO: Combinar TODAS as massas (docinhos + bolos)
            const allMasses = [...docinhoMassesData, ...cakeMassesData]

            setCandies(candiesData || [])
            setCakes(cakesData || [])
            setCakeMasses(allMasses || []) // Usar todas as massas combinadas
            setCakeFrostings(cakeFrostingsData || [])
            setProducts(productsData || [])

            // Calcular custo por minuto
            const totalCostPerMinute = fixedCostsData.reduce((sum, cost) => sum + (parseFloat(cost.costPerMinute) || 0), 0)
            setCostPerMinute(totalCostPerMinute)

            console.log('✅ Dados carregados para Goals:')
            console.log('🍬 Docinhos:', candiesData?.length || 0)
            console.log('🎂 Bolos:', cakesData?.length || 0)
            console.log('📦 Massas de bolo:', cakeMassesData?.length || 0)
            console.log('📦 Massas de docinho:', docinhoMassesData?.length || 0)
            console.log('📦 TODAS as massas:', allMasses.length)
            console.log('🍦 Coberturas:', cakeFrostingsData?.length || 0)
            console.log('📊 Produtos:', productsData?.length || 0)
            console.log('⏰ Custo por minuto:', totalCostPerMinute)

            // Debug dos primeiros itens - CORRIGIDO
            if (cakesData?.length > 0) {
                const firstCake = cakesData[0]
                console.log('🔍 Primeiro bolo:', firstCake)
                console.log('📦 Massas do primeiro bolo:', firstCake?.masses)
                console.log('🍦 Coberturas do primeiro bolo:', firstCake?.frostings)

                // Verificar se as massas do bolo existem no sistema
                if (firstCake?.masses) {
                    firstCake.masses.forEach((massItem, index) => {
                        const foundMass = allMasses.find(m => m.name === massItem.massName)
                        console.log(`🔍 Massa ${index + 1} "${massItem.massName}" encontrada:`, !!foundMass)
                        if (foundMass) {
                            console.log(`📊 Dados da massa "${massItem.massName}":`, {
                                totalGrams: foundMass.totalGrams,
                                ingredients: foundMass.ingredients?.length || 0,
                                cost: foundMass.cost
                            })
                        }
                    })
                }
            }

            if (allMasses?.length > 0) {
                console.log('📦 Primeira massa do sistema:', allMasses[0])
                console.log('🧮 Ingredientes da primeira massa:', allMasses[0]?.ingredients)
            }

            setDebugInfo(`
        Docinhos: ${candiesData?.length || 0}
        Bolos: ${cakesData?.length || 0}
        Massas: ${allMasses.length}
        Coberturas: ${cakeFrostingsData?.length || 0}
        Produtos: ${productsData?.length || 0}
      `)

        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error)
            setDebugInfo(`Erro: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // FUNÇÃO CORRIGIDA: Encontrar massa pelo nome (busca em TODAS as massas)
    const findMassByName = (massName) => {
        if (!massName) {
            console.log('❌ Nome da massa não fornecido')
            return null
        }

        console.log(`🔍 Buscando massa: "${massName}"`)

        // Buscar exatamente pelo nome
        let mass = cakeMasses.find(m => m.name === massName)

        if (!mass) {
            console.log(`⚠️ Massa "${massName}" não encontrada exatamente, procurando por similaridade...`)
            // Tentar encontrar por similaridade
            mass = cakeMasses.find(m =>
                m.name.toLowerCase().includes(massName.toLowerCase()) ||
                massName.toLowerCase().includes(m.name.toLowerCase())
            )
        }

        if (mass) {
            console.log(`✅ Massa encontrada: "${mass.name}"`)
            console.log(`📊 Dados da massa:`, {
                totalGrams: mass.totalGrams,
                ingredientsCount: mass.ingredients?.length || 0,
                cost: mass.cost
            })
        } else {
            console.log(`❌ Massa "${massName}" NÃO encontrada`)
            console.log(`📋 Massas disponíveis:`, cakeMasses.map(m => m.name))
        }

        return mass
    }

    // FUNÇÃO CORRIGIDA: Encontrar cobertura pelo nome
    const findFrostingByName = (frostingName) => {
        if (!frostingName) {
            console.log('❌ Nome da cobertura não fornecido')
            return null
        }

        console.log(`🔍 Buscando cobertura: "${frostingName}"`)

        const frosting = cakeFrostings.find(f => f.name === frostingName)

        if (frosting) {
            console.log(`✅ Cobertura encontrada: "${frosting.name}"`)
        } else {
            console.log(`❌ Cobertura "${frostingName}" NÃO encontrada`)
            console.log(`📋 Coberturas disponíveis:`, cakeFrostings.map(f => f.name))
        }

        return frosting
    }

    // FUNÇÃO CORRIGIDA: Calcular custo de ingrediente
    const calculateIngredientCost = (ingredient) => {
        if (!ingredient || !ingredient.productId || !ingredient.grams) {
            console.log('❌ Ingrediente inválido:', ingredient)
            return 0
        }

        const product = products.find(p => p._id === ingredient.productId)
        if (!product) {
            console.log('❌ Produto não encontrado para ingrediente:', ingredient.productId)
            return 0
        }

        const ingredientGrams = parseFloat(ingredient.grams)
        if (isNaN(ingredientGrams)) {
            console.log('❌ Grams inválido:', ingredient.grams)
            return 0
        }

        let cost = 0
        if (product.unit === 'un') {
            const unitWeight = 50 // padrão 50g por unidade
            const units = ingredientGrams / unitWeight
            cost = units * (product.unitCost || product.costPerUnit || 0)
        } else {
            cost = ingredientGrams * (product.baseUnitCost || product.costPerUnit || 0)
        }

        return cost
    }

    // FUNÇÃO CORRIGIDA: Calcular custo de uma massa/cobertura
    const calculateMassOrFrostingCost = (item) => {
        if (!item || !item.ingredients) {
            console.log('❌ Item sem ingredientes:', item?.name)
            return 0
        }

        console.log(`🧮 Calculando custo para: ${item.name}`)

        const totalCost = item.ingredients.reduce((total, ingredient, index) => {
            const cost = calculateIngredientCost(ingredient)
            return total + cost
        }, 0)

        console.log(`💰 Custo total ${item.name}: R$ ${totalCost.toFixed(2)}`)
        return totalCost
    }

    // Função para calcular custo com tempo
    const calculateTimeCost = (preparationTime) => {
        if (!preparationTime || costPerMinute === 0) return 0
        const timeCost = costPerMinute * parseFloat(preparationTime)
        return timeCost
    }

    // FUNÇÃO PRINCIPAL CORRIGIDA: Calcular custo completo do bolo
    const calculateCakeCost = (cake) => {
        console.log('🎯 CALCULANDO CUSTO DO BOLO:', cake.name)

        let totalCost = 0
        let massCost = 0
        let frostingCost = 0
        let timeCost = 0

        // 1. Calcular custo das massas - CORRIGIDO
        if (cake.masses && cake.masses.length > 0) {
            console.log('📦 Processando massas:', cake.masses.length)

            cake.masses.forEach((massItem, index) => {
                console.log(`🔍 Procurando massa ${index + 1}:`, massItem.massName)

                const mass = findMassByName(massItem.massName)

                if (mass) {
                    // Calcular custo total da massa
                    const massTotalCost = mass.cost || calculateMassOrFrostingCost(mass)

                    if (mass.totalGrams && mass.totalGrams > 0) {
                        // Calcular custo por grama
                        const massCostPerGram = massTotalCost / mass.totalGrams

                        // Calcular custo da quantidade usada no bolo
                        const massGrams = parseFloat(massItem.grams) || 0
                        const thisMassCost = massCostPerGram * massGrams

                        console.log(`💰 Massa "${mass.name}": ${massGrams}g × R$ ${massCostPerGram.toFixed(6)}/g = R$ ${thisMassCost.toFixed(2)}`)

                        massCost += thisMassCost
                        totalCost += thisMassCost
                    } else {
                        console.log('⚠️ Massa sem totalGrams definido')
                    }
                } else {
                    console.log('❌ Massa não encontrada no sistema:', massItem.massName)
                }
            })
        } else {
            console.log('⚠️ Nenhuma massa definida para o bolo')
        }

        // 2. Calcular custo das coberturas - CORRIGIDO
        if (cake.frostings && cake.frostings.length > 0) {
            console.log('🍦 Processando coberturas:', cake.frostings.length)

            cake.frostings.forEach((frostingItem, index) => {
                console.log(`🔍 Procurando cobertura ${index + 1}:`, frostingItem.frostingName)

                const frosting = findFrostingByName(frostingItem.frostingName)

                if (frosting) {
                    // Calcular custo total da cobertura
                    const frostingTotalCost = frosting.cost || calculateMassOrFrostingCost(frosting)

                    if (frosting.totalGrams && frosting.totalGrams > 0) {
                        // Calcular custo por grama
                        const frostingCostPerGram = frostingTotalCost / frosting.totalGrams

                        // Calcular custo da quantidade usada no bolo
                        const frostingGrams = parseFloat(frostingItem.grams) || 0
                        const thisFrostingCost = frostingCostPerGram * frostingGrams

                        console.log(`💰 Cobertura "${frosting.name}": ${frostingGrams}g × R$ ${frostingCostPerGram.toFixed(6)}/g = R$ ${thisFrostingCost.toFixed(2)}`)

                        frostingCost += thisFrostingCost
                        totalCost += thisFrostingCost
                    } else {
                        console.log('⚠️ Cobertura sem totalGrams definido')
                    }
                } else {
                    console.log('❌ Cobertura não encontrada no sistema:', frostingItem.frostingName)
                }
            })
        } else {
            console.log('⚠️ Nenhuma cobertura definida para o bolo')
        }

        // 3. Calcular custo do tempo
        timeCost = calculateTimeCost(cake.preparationTime)
        totalCost += timeCost

        console.log('📊 RESUMO FINAL DO BOLO', cake.name)
        console.log('💰 Custo massas:', massCost.toFixed(2))
        console.log('💰 Custo coberturas:', frostingCost.toFixed(2))
        console.log('💰 Custo tempo:', timeCost.toFixed(2))
        console.log('💰 Custo total:', totalCost.toFixed(2))

        return {
            materialCost: massCost + frostingCost,
            massCost,
            frostingCost,
            timeCost,
            totalCost
        }
    }

    // Função para docinhos (simplificada)
    const calculateCandyCost = (candy) => {
        console.log('🍬 CALCULANDO CUSTO DO DOCINHO:', candy.name)

        const materialCost = candy.costPerUnit || 0
        const timeCost = calculateTimeCost(candy.preparationTime)
        const totalCost = materialCost + timeCost

        console.log('💰 Custo material:', materialCost.toFixed(2))
        console.log('⏰ Custo tempo:', timeCost.toFixed(2))
        console.log('💵 Custo total:', totalCost.toFixed(2))

        return {
            materialCost,
            timeCost,
            totalCost
        }
    }

    // Função unificada para calcular custo de qualquer produto
    const identifyProductType = (product) => {
        console.log(`🔍 Identificando tipo para: ${product.name}`)

        // PRIMEIRO: Verificar em qual array o produto está
        const isInCandies = candies.some(c => c._id === product._id)
        const isInCakes = cakes.some(c => c._id === product._id)

        console.log(`📊 Encontrado em: candies=${isInCandies}, cakes=${isInCakes}`)

        // SE está no array de candies, é DOCINHO (mesmo que tenha massas)
        if (isInCandies) {
            console.log(`✅ Identificado como DOCINHO (está no array de docinhos)`)
            return 'candy'
        }

        // SE está no array de cakes, é BOLO
        if (isInCakes) {
            console.log(`✅ Identificado como BOLO (está no array de bolos)`)
            return 'cake'
        }

        // FALLBACK: Se não encontrou em nenhum array, usar lógica estrutural
        const hasMasses = product.masses && product.masses.length > 0
        const hasFrostings = product.frostings && product.frostings.length > 0
        const hasCostPerUnit = product.costPerUnit !== undefined

        if ((hasMasses || hasFrostings) && !hasCostPerUnit) {
            console.log(`✅ Identificado como BOLO (tem estrutura de bolo)`)
            return 'cake'
        }

        if (hasCostPerUnit && !hasMasses && !hasFrostings) {
            console.log(`✅ Identificado como DOCINHO (tem costPerUnit)`)
            return 'candy'
        }

        // Fallback final
        console.log(`⚠️ Tipo não identificado, assumindo DOCINHO`)
        return 'candy'
    }
    // FUNÇÃO DE DEBUG para estrutura do produto
    const debugProductStructure = (product) => {
        console.log('🔍 DEBUG - Estrutura completa do produto:', product.name)
        console.log('📊 CostPerUnit:', product.costPerUnit)
        console.log('🎂 Massas:', product.masses)
        console.log('🍦 Coberturas:', product.frostings)
        console.log('⏰ Tempo preparo:', product.preparationTime)
        console.log('🏷️ Preço venda:', product.salePrice || product.price)
        console.log('📦 Encontrado em cakes:', !!cakes.find(c => c._id === product._id))
        console.log('🍬 Encontrado em candies:', !!candies.find(c => c._id === product._id))
        console.log('---')
    }

    // Função unificada para calcular custo de qualquer produto - CORRIGIDA
    const calculateProductCost = (product) => {
        console.log('🎯 CALCULANDO CUSTO DO PRODUTO:', product.name)

        // Debug da estrutura primeiro
        debugProductStructure(product)

        const productType = identifyProductType(product)
        console.log(`📦 Tipo final identificado: ${productType}`)

        if (productType === 'candy') {
            console.log('🍬 Calculando como DOCINHO')
            return calculateCandyCost(product)
        }

        console.log('🎂 Calculando como BOLO')
        return calculateCakeCost(product)
    }

    const calculateGoals = () => {
        if (!selectedProduct || !goalData.firstGoal) {
            alert('Selecione um produto e defina a primeira meta')
            return
        }

        console.log('🎯 CALCULANDO METAS PARA:', selectedProduct.name)

        const firstGoal = parseFloat(goalData.firstGoal)
        const secondGoal = parseFloat(goalData.secondGoal) || firstGoal * 1.5
        const workingDays = parseInt(goalData.workingDays)
        const dailyHours = parseInt(goalData.dailyHours)

        // Calcular custo do produto
        const costBreakdown = calculateProductCost(selectedProduct)
        const salePrice = selectedProduct.salePrice || selectedProduct.price || 0
        const profitPerUnit = salePrice - costBreakdown.totalCost

        console.log('💰 Custo calculado:', costBreakdown)
        console.log('🏷️ Preço de venda:', salePrice)
        console.log('💵 Lucro por unidade:', profitPerUnit)

        if (profitPerUnit <= 0) {
            alert('Este produto não tem lucro por unidade. Verifique o preço de venda e custo.')
            return
        }

        // Cálculos para primeira meta
        const unitsFirstGoal = Math.ceil(firstGoal / profitPerUnit)
        const dailyUnitsFirstGoal = Math.ceil(unitsFirstGoal / workingDays)
        const hourlyUnitsFirstGoal = Math.ceil(dailyUnitsFirstGoal / dailyHours)

        // Cálculos para segunda meta
        const unitsSecondGoal = Math.ceil(secondGoal / profitPerUnit)
        const dailyUnitsSecondGoal = Math.ceil(unitsSecondGoal / workingDays)
        const hourlyUnitsSecondGoal = Math.ceil(dailyUnitsSecondGoal / dailyHours)

        setCalculation({
            product: selectedProduct,
            costBreakdown,
            salePrice,
            profitPerUnit,
            firstGoal: {
                targetProfit: firstGoal,
                unitsNeeded: unitsFirstGoal,
                dailyUnits: dailyUnitsFirstGoal,
                hourlyUnits: hourlyUnitsFirstGoal
            },
            secondGoal: {
                targetProfit: secondGoal,
                unitsNeeded: unitsSecondGoal,
                dailyUnits: dailyUnitsSecondGoal,
                hourlyUnits: hourlyUnitsSecondGoal
            },
            workingDays,
            dailyHours,
            costPerMinute
        })
    }

    const ProductCard = ({ product, type }) => {
        const actualType = identifyProductType(product)
        const costBreakdown = calculateProductCost(product)
        const salePrice = product.salePrice || product.price || 0
        const profit = salePrice - costBreakdown.totalCost
        const preparationTime = product.preparationTime || 0

        return (
            <div
                className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedProduct?._id === product._id
                        ? 'bg-blue-500/20 border-2 border-blue-500'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                onClick={() => setSelectedProduct(product)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${actualType === 'cake' ? 'bg-orange-500' : 'bg-purple-500'
                        }`}>
                        {actualType === 'cake' ? <FaBirthdayCake size={16} /> : <FaCookie size={16} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{product.name}</h3>

                        {/* Indicador de tipo */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${actualType === 'cake'
                                    ? 'bg-orange-500/20 text-orange-300'
                                    : 'bg-purple-500/20 text-purple-300'
                                }`}>
                                {actualType === 'cake' ? '🎂 Bolo' : '🍬 Docinho'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-xs text-white/60">
                            <div>Venda: R$ {salePrice.toFixed(2)}</div>
                            <div>Total: R$ {costBreakdown.totalCost.toFixed(2)}</div>
                            <div>Material: R$ {costBreakdown.materialCost.toFixed(2)}</div>
                            <div>Tempo: R$ {costBreakdown.timeCost.toFixed(2)}</div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                            <div className={`text-xs font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Lucro: R$ {profit.toFixed(2)}
                            </div>
                            {preparationTime > 0 && (
                                <div className="text-xs text-blue-400 flex items-center gap-1">
                                    <FaClock size={10} />
                                    {preparationTime}min
                                </div>
                            )}
                        </div>

                        {/* Informações específicas */}
                        {actualType === 'cake' && (
                            <div className="text-xs text-orange-300 mt-1">
                                🎂 {product.masses?.length || 0} massas, {product.frostings?.length || 0} coberturas
                            </div>
                        )}
                        {actualType === 'candy' && product.costPerUnit && (
                            <div className="text-xs text-purple-300 mt-1">
                                🍬 Custo unitário: R$ {product.costPerUnit.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <Layout activePage="goals">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
                            <FaCalculator className="animate-pulse w-8 h-8" />
                        </div>
                        <p className="text-white/60">Carregando dados...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout activePage="goals">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">
                    Metas de Vendas
                </h1>
                <p className="text-secondary text-sm md:text-base">
                    Defina suas metas de lucro e calcule quantos produtos precisa vender
                </p>
            </div>

            {/* Botão para recarregar dados */}
            <div className="mb-6">
                <GlassButton
                    onClick={loadAllData}
                    variant="secondary"
                    className="text-sm"
                >
                    <FaSync className="w-4 h-4" />
                    Recarregar Dados
                </GlassButton>
            </div>

            {/* Informação do Custo por Minuto */}
            {costPerMinute > 0 && (
                <div className="mb-6">
                    <GlassCard className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500 flex items-center justify-center text-white">
                                    <FaIndustry size={16} />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Custo por Minuto Atual</h3>
                                    <p className="text-white/60 text-sm">Considerado no cálculo do custo de tempo</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-purple-400 font-bold text-xl">
                                    R$ {costPerMinute.toFixed(8)}
                                </div>
                                <div className="text-white/60 text-sm">por minuto</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Coluna 1: Seleção de Produto e Configurações */}
                <div className="space-y-6">
                    {/* Seleção de Produto */}
                    <GlassCard className="p-4 md:p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FaBullseye className="w-5 h-5" />
                            Selecionar Produto
                        </h2>

                        <div className="space-y-4">
                            {/* Docinhos */}
                            <div>
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <FaCookie className="w-4 h-4" />
                                    Docinhos ({candies.length})
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {candies.map(candy => (
                                        <ProductCard key={candy._id} product={candy} type="candy" />
                                    ))}
                                    {candies.length === 0 && (
                                        <div className="text-center py-4 text-white/60">
                                            Nenhum docinho cadastrado
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bolos */}
                            <div>
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <FaBirthdayCake className="w-4 h-4" />
                                    Bolos ({cakes.length})
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {cakes.map(cake => (
                                        <ProductCard key={cake._id} product={cake} type="cake" />
                                    ))}
                                    {cakes.length === 0 && (
                                        <div className="text-center py-4 text-white/60">
                                            Nenhum bolo cadastrado
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Configurações de Meta */}
                    <GlassCard className="p-4 md:p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartLine className="w-5 h-5" />
                            Configurar Metas
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/60 text-sm mb-2">
                                    Primeira Meta de Lucro (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={goalData.firstGoal}
                                    onChange={(e) => setGoalData({ ...goalData, firstGoal: e.target.value })}
                                    placeholder="Ex: 2000.00"
                                    className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-white/60 text-sm mb-2">
                                    Segunda Meta de Lucro (R$ - Opcional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={goalData.secondGoal}
                                    onChange={(e) => setGoalData({ ...goalData, secondGoal: e.target.value })}
                                    placeholder="Ex: 3000.00"
                                    className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/60 text-sm mb-2">
                                        Dias Úteis no Mês
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={goalData.workingDays}
                                        onChange={(e) => setGoalData({ ...goalData, workingDays: e.target.value })}
                                        className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-2">
                                        Horas por Dia
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={goalData.dailyHours}
                                        onChange={(e) => setGoalData({ ...goalData, dailyHours: e.target.value })}
                                        className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <GlassButton
                                onClick={calculateGoals}
                                disabled={!selectedProduct || !goalData.firstGoal}
                                className="w-full h-12 mt-4"
                            >
                                <FaCalculator className="w-4 h-4" />
                                <span>Calcular Metas</span>
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>

                {/* Coluna 2: Resultados */}
                <div>
                    {calculation ? (
                        <GlassCard className="p-4 md:p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <FaDollarSign className="w-5 h-5" />
                                Resultado das Metas - {calculation.product.name}
                            </h2>

                            <div className="space-y-6">
                                {/* Resumo do Produto */}
                                <div className="bg-white/5 rounded-2xl p-4">
                                    <h3 className="text-white font-semibold mb-3">Resumo do Produto</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-white/60">Preço de Venda:</span>
                                            <div className="text-white font-semibold">R$ {calculation.salePrice.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <span className="text-white/60">Custo Unitário:</span>
                                            <div className="text-white font-semibold">R$ {calculation.costBreakdown.totalCost.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <span className="text-white/60">Custo Materiais:</span>
                                            <div className="text-orange-400 font-semibold">R$ {calculation.costBreakdown.materialCost.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <span className="text-white/60">Custo Tempo:</span>
                                            <div className="text-purple-400 font-semibold">R$ {calculation.costBreakdown.timeCost.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <span className="text-white/60">Lucro por Unidade:</span>
                                            <div className="text-green-400 font-semibold">R$ {calculation.profitPerUnit.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <span className="text-white/60">Configuração:</span>
                                            <div className="text-white font-semibold">{calculation.workingDays}d × {calculation.dailyHours}h</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Primeira Meta */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                                    <h3 className="text-blue-300 font-semibold mb-4 flex items-center gap-2">
                                        <FaBullseye className="w-4 h-4" />
                                        Primeira Meta: R$ {calculation.firstGoal.targetProfit.toFixed(2)}
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/80">Unidades no Mês:</span>
                                            <span className="text-white font-bold text-lg">{calculation.firstGoal.unitsNeeded}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/80">Unidades por Dia:</span>
                                            <span className="text-white font-semibold">{calculation.firstGoal.dailyUnits}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/80">Unidades por Hora:</span>
                                            <span className="text-white font-semibold">{calculation.firstGoal.hourlyUnits}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Segunda Meta */}
                                {calculation.secondGoal.targetProfit > calculation.firstGoal.targetProfit && (
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                                        <h3 className="text-purple-300 font-semibold mb-4 flex items-center gap-2">
                                            <FaChartLine className="w-4 h-4" />
                                            Segunda Meta: R$ {calculation.secondGoal.targetProfit.toFixed(2)}
                                        </h3>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/80">Unidades no Mês:</span>
                                                <span className="text-white font-bold text-lg">{calculation.secondGoal.unitsNeeded}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/80">Unidades por Dia:</span>
                                                <span className="text-white font-semibold">{calculation.secondGoal.dailyUnits}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/80">Unidades por Hora:</span>
                                                <span className="text-white font-semibold">{calculation.secondGoal.hourlyUnits}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dicas */}
                                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                    <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                                        <FaClock className="w-4 h-4" />
                                        Dicas para Alcançar suas Metas
                                    </h3>
                                    <ul className="text-green-200 text-sm space-y-1">
                                        <li>• Organize sua produção em lotes</li>
                                        <li>• Otimize seu tempo de preparo</li>
                                        <li>• Considere aumentar seus preços se necessário</li>
                                        <li>• Diversifique seus produtos</li>
                                        <li>• Invista em marketing e divulgação</li>
                                        <li>• Use a calculadora de lotes para planejar produção</li>
                                    </ul>
                                </div>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 mx-auto mb-4">
                                <FaCalculator className="w-8 h-8" />
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-2">
                                Calcule suas Metas
                            </h3>
                            <p className="text-white/60">
                                Selecione um produto, defina suas metas de lucro e clique em calcular para ver quantas unidades precisa vender.
                            </p>
                            {selectedProduct && (
                                <div className="mt-4 p-3 bg-blue-500/10 rounded-xl">
                                    <p className="text-blue-300 text-sm">
                                        Produto selecionado: <strong>{selectedProduct.name}</strong>
                                    </p>
                                </div>
                            )}
                        </GlassCard>
                    )}
                </div>
            </div>
        </Layout>
    )
}