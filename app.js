var budgetController = (function(){

    var Expense = function(id,description,value){
      
        this.id = id;
        this.description = description;
        this.value = value;
        percentage = -1;
    
    }
    Expense.prototype.calcPercentage = function(totalIncom){
        if(totalIncom > 0){
            this.percentage = Math.round((this.value / totalIncom) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){

        return this.percentage;

    };
    var Income = function(id,description,value){
      
        this.id = id;
        this.description = description;
        this.value = value;
    
    }

   

    var calculateTotal  = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum += current.value;
        });

        data.totals[type] = sum;
    }

    var data = {
        
        allItems: {
            exp: [],
            inc: []
            
        },

        totals: {
            exp:0,
            inc: 0
        },

        budget: 0,
        percentage: -1,

    }

    return {
        addItem: function(type,des,val){
            var newItem,ID;

            //create new ID
            if(data.allItems[type].length > 0){
            
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            }else{
                ID = 0;
            }
            
            //create new item based on type 'inc' or 'exp'
            if(type === 'inc'){
        
                newItem = new Income(ID,des,val)
        
            }else if(type === 'exp'){
        
                newItem = new Expense(ID,des,val)
            }

            //pushed it our data structure
            data.allItems[type].push(newItem);
            
            //return new item
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);

            }

        },

        calculateBudget: function(){
            // Calculate total incomes and expenses
            calculateTotal('inc');
            calculateTotal('exp');
        
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc === 0){
                data.percentage = '-' +  data.totals.exp;
            }else{
                // Calculate the percentage of budget that we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc ) * 100);
            }
        },

        calculatePercentages: function(){

            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });

        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        getPercentages: function(){

            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPerc;
        },

        testing: function(){
            console.log(data.allItems);
        }
    }

})();

var UIController = (function(){

    var DOMstrings = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        btn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container : '.container',
        expansesPercLabel : '.item__percentage'
    }

    var formateNumber = function(num, type){
        var numSplit, int, dec;
        // return the absolute number if the minus sign is there it will remove that sign
        num = Math.abs(num);

        //return the 2 rounded decimal numbers after the integer values
        num = num.toFixed(2);

        // saperated number and decimal values
        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];
        

        /*
        2300 -> 2,300
        23000 -> 23,00.00
        233530 -> 2,33,530.00        
        2345630 -> 23,45,630.00        
        */

        if(int.length > 3 && int.length < 8){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,3);
        }

        return (type == 'exp' ? '-' : '+') + int + '.' + dec;

    }

    var nodeListForEach = function(list, fun){
        for(var i = 0; i < list.length; i++){
            fun(list[i],i);
        }
    }

    return {
        getInput: function(){

            return {
                type:  document.querySelector(DOMstrings.addType).value,
                description:  document.querySelector(DOMstrings.addDescription).value,
                value:  parseFloat(document.querySelector(DOMstrings.addValue).value),
            };
             
        },

        addListItem: function(obj,type){
            var html, newHtml, element;

            if(type === 'inc'){
            
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }else if(type === 'exp'){
            
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }

            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formateNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);   
        },

        deleteListItem: function(selectorId){
        
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields =  document.querySelectorAll(DOMstrings.addDescription + ',' + DOMstrings.addValue);
            
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = formateNumber(obj.totalInc , type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formateNumber(obj.totalExp,type);
            if(obj.percentage > -1){
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';

            }

        },

        displayPercentage: function(percentage){

            var fields = document.querySelectorAll(DOMstrings.expansesPercLabel);

            
            
            nodeListForEach(fields, function(current, index){
                if(percentage[index] > 0){
                    current.textContent = percentage + '%';
                }else{
                    current.textContent = '--';
                }
            });

        },

        changedType: function(){
            var fields = document.querySelectorAll(DOMstrings.addType + ',' + DOMstrings.addValue + ',' + DOMstrings.addDescription);
            // nodeListForEach(fields, function(current){
            //     current.classList.toggle('red-focus');
            // });

            for(var i = 0; i < fields.length; i++){
                fields[i].classList.toggle('red-focus');
            }

            document.querySelector(DOMstrings.btn).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    }

})();

var controller = (function(budgetCtrl,UICtrl){

    var setupEventListeners = function(){
        
        var doms = UICtrl.getDOMstrings();

        document.querySelector(doms.btn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
    
            if(event.keyCode === 13 || event.which === 13){
    
                ctrlAddItem();
    
            }
        });

        document.querySelector(doms.container).addEventListener('click',ctrlDeleteItem)

        document.querySelector(doms.addType).addEventListener('change',UIController.changedType);
    };

    var updateBudget = function(){

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

        // console.log(budget);

    };

    var updatePercentages = function(){
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from budget controller
        var allPercentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the update percentages
        // console.log(allPercentages);
        UIController.displayPercentage(allPercentages);
    
    }
    var ctrlAddItem = function(){
        var newItem, inputs;
        // 1: get input data
        inputs = UICtrl.getInput();
        
        if(inputs.description !== "" && inputs.value > 0){

            //2. Add item to budget controller
            newItem = budgetController.addItem(inputs.type, inputs.description, inputs.value);

            //3. Add item to UI controller
            UIController.addListItem(newItem, inputs.type);

            //4. clearing fields
            UIController.clearFields();

            // 5. Calculate and Update Budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages()
        };
       
    }

    function ctrlDeleteItem(event){
        var itemId,id,type,splitId;
        itemId =  event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId = itemId.split('-');

            type = splitId[0];
            id = parseInt(splitId[1]);

            // delete the item form data structure
            budgetCtrl.deleteItem(type, id);

            // update the UI
            UICtrl.deleteListItem(itemId);

            // re-calculate the new budget
            updateBudget();
        
            // Calculate and update percentages
            updatePercentages()
        }
    }

    return {
        init: function(){
            setupEventListeners();
            console.log('App started');
        }
    }

})(budgetController,UIController);

controller.init();